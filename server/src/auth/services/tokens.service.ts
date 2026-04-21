import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';

interface RefreshPayload {
  sub: string;
  jti: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresAt: Date;
}

export interface RotateResult {
  userId: string;
  keepSignedIn: boolean;
}

const sha256 = (input: string) => createHash('sha256').update(input).digest('hex');

function parseDurationSeconds(value: string, fallback: number): number {
  const match = /^(\d+)\s*([smhd])?$/i.exec(value.trim());
  if (!match) return fallback;
  const n = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return n * mult;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {}

  private accessSecret() {
    return this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret';
  }

  private refreshSecret() {
    return this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret';
  }

  private accessTtlSeconds() {
    return parseDurationSeconds(this.config.get<string>('JWT_ACCESS_TTL') ?? '15m', 900);
  }

  refreshTtlSeconds(keepSignedIn: boolean) {
    const key = keepSignedIn ? 'JWT_REFRESH_TTL_EXTENDED' : 'JWT_REFRESH_TTL_DEFAULT';
    const fallback = keepSignedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    return parseDurationSeconds(
      this.config.get<string>(key) ?? (keepSignedIn ? '30d' : '1d'),
      fallback,
    );
  }

  async issue(
    user: { id: string; email: string },
    keepSignedIn: boolean,
    meta: { userAgent?: string | null; ipAddress?: string | null } = {},
  ): Promise<IssuedTokens> {
    const accessTtl = this.accessTtlSeconds();
    const refreshTtl = this.refreshTtlSeconds(keepSignedIn);
    const jti = randomUUID();

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { secret: this.accessSecret(), expiresIn: accessTtl },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti },
      { secret: this.refreshSecret(), expiresIn: refreshTtl },
    );

    const expiresAt = new Date(Date.now() + refreshTtl * 1000);
    await this.refreshRepo.save(
      this.refreshRepo.create({
        userId: user.id,
        tokenHash: sha256(jti),
        expiresAt,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
      }),
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: accessTtl,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async verifyAndConsumeRefresh(incoming: string): Promise<RotateResult> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(incoming, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = sha256(payload.jti);
    const row = await this.refreshRepo.findOne({ where: { tokenHash } });

    if (!row) throw new UnauthorizedException('Invalid refresh token');

    if (row.revokedAt || row.expiresAt.getTime() < Date.now()) {
      await this.refreshRepo
        .createQueryBuilder()
        .update()
        .set({ revokedAt: new Date() })
        .where('user_id = :userId AND revoked_at IS NULL', { userId: payload.sub })
        .execute();
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    row.revokedAt = new Date();
    await this.refreshRepo.save(row);

    const lifespanMs = row.expiresAt.getTime() - row.createdAt.getTime();
    const keepSignedIn = lifespanMs > 1000 * 60 * 60 * 24 * 2;
    return { userId: payload.sub, keepSignedIn };
  }

  async revoke(refreshToken: string): Promise<void> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.refreshSecret(),
      });
      await this.refreshRepo
        .createQueryBuilder()
        .update()
        .set({ revokedAt: new Date() })
        .where('token_hash = :h AND revoked_at IS NULL', { h: sha256(payload.jti) })
        .execute();
    } catch {
      // Idempotent logout
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshRepo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute();
  }
}
