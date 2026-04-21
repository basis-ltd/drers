import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { RolesService } from '../roles/roles.service';
import { UserTenantRolesService } from '../user-tenant-roles/user-tenant-roles.service';
import { RoleName } from '../common/enums';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { TokensService, IssuedTokens } from './services/tokens.service';
import { EmailService } from './services/email.service';

const BCRYPT_ROUNDS = 12;
const RNEC_TENANT_CODE = 'RNEC';
const VERIFICATION_GENERIC_MESSAGE =
  'If the account exists and is not yet verified, a new verification email has been sent.';
const FORGOT_GENERIC_MESSAGE =
  'If an account exists for that email, a reset link has been sent.';

const sha256 = (input: string) =>
  createHash('sha256').update(input).digest('hex');

interface RequestMeta {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface AuthUserView {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  emailVerified: boolean;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly tenants: TenantsService,
    private readonly roles: RolesService,
    private readonly userTenantRoles: UserTenantRolesService,
    private readonly tokens: TokensService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,
  ) {}

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  }

  private view(user: {
    id: string;
    email: string;
    firstName: string;
    surname: string;
    emailVerified: boolean;
    isActive: boolean;
  }): AuthUserView {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      surname: user.surname,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    };
  }

  async register(
    dto: RegisterDto,
    meta: RequestMeta = {},
  ): Promise<{ message: string }> {
    const existing = await this.users.findByEmail(dto.email);

    // No enumeration: respond identically whether or not the email is new.
    if (existing) {
      if (!existing.emailVerified) {
        await this.issueVerificationToken(
          existing.id,
          existing.email,
          existing.firstName,
        );
      }
      return { message: VERIFICATION_GENERIC_MESSAGE };
    }

    const tenant = await this.tenants.findByCode(RNEC_TENANT_CODE);
    if (!tenant) {
      this.logger.error(
        `Default tenant ${RNEC_TENANT_CODE} not found — seed the database.`,
      );
      throw new NotFoundException('Registration is temporarily unavailable.');
    }
    const role = await this.roles.findRoleByName(RoleName.APPLICANT);
    if (!role) {
      this.logger.error(`APPLICANT role not found — seed the database.`);
      throw new NotFoundException('Registration is temporarily unavailable.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      surname: dto.surname,
      phone: dto.phone ?? null,
      institutionalAffiliation: dto.institutionalAffiliation ?? null,
      emailVerified: false,
      isActive: true,
    });

    await this.userTenantRoles.assign({
      userId: user.id,
      tenantId: tenant.id,
      roleId: role.id,
      isPrimary: true,
      createdById: user.id,
    });

    await this.issueVerificationToken(user.id, user.email, user.firstName);
    return { message: VERIFICATION_GENERIC_MESSAGE };
  }

  private async issueVerificationToken(
    userId: string,
    email: string,
    firstName: string,
  ): Promise<void> {
    const raw = randomBytes(32).toString('hex');
    const hours = Number(
      this.config.get<string>('EMAIL_VERIFY_TTL_HOURS') ?? 24,
    );
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);
    await this.users.setEmailVerificationToken(userId, sha256(raw), expiresAt);
    const verifyUrl = `${this.frontendUrl()}/auth/verify?token=${raw}`;
    await this.email.sendVerificationEmail(email, firstName, verifyUrl);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = sha256(dto.token);
    const user = await this.users.findByEmailVerificationTokenHash(tokenHash);
    if (!user)
      throw new BadRequestException('Invalid or expired verification link.');
    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired verification link.');
    }
    await this.users.markEmailVerified(user.id);
    return { message: 'Email verified. You can now sign in.' };
  }

  async resendVerification(
    dto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    const user = await this.users.findByEmail(dto.email);
    if (user && !user.emailVerified && user.isActive) {
      await this.issueVerificationToken(user.id, user.email, user.firstName);
    }
    return { message: VERIFICATION_GENERIC_MESSAGE };
  }

  async login(
    dto: LoginDto,
    meta: RequestMeta = {},
  ): Promise<{ user: AuthUserView } & IssuedTokens> {
    const user = await this.users.findByEmail(dto.email);
    // bcrypt.compare against a throwaway hash if user missing — equalises timing.
    const placeholder =
      '$2b$12$CwTycUXWue0Thq9StjUM0uJ8.K8iuZZ3VQ6j5W5xM3Z3yBfRw9cMa';
    const passwordOk = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? placeholder,
    );
    if (!user || !passwordOk) {
      throw new BadRequestException('Invalid email or password.');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Your account has been disabled.');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before signing in.',
      );
    }

    await this.users.updateLastLogin(user.id);

    const issued = await this.tokens.issue(
      { id: user.id, email: user.email },
      Boolean(dto.keepSignedIn),
      meta,
    );
    return { user: this.view(user), ...issued };
  }

  async refresh(
    refreshToken: string,
    meta: RequestMeta = {},
  ): Promise<{ user: AuthUserView } & IssuedTokens> {
    const { userId, keepSignedIn } =
      await this.tokens.verifyAndConsumeRefresh(refreshToken);
    const user = await this.users.findOne(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account not available.');
    }
    const issued = await this.tokens.issue(
      { id: user.id, email: user.email },
      keepSignedIn,
      meta,
    );
    return { user: this.view(user), ...issued };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.tokens.revoke(refreshToken);
    return { message: 'Signed out.' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.users.findByEmail(dto.email);
    if (user && user.isActive) {
      const raw = randomBytes(32).toString('hex');
      const minutes = Number(
        this.config.get<string>('PASSWORD_RESET_TTL_MINUTES') ?? 60,
      );
      const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
      await this.resetRepo.save(
        this.resetRepo.create({
          userId: user.id,
          tokenHash: sha256(raw),
          expiresAt,
        }),
      );
      const resetUrl = `${this.frontendUrl()}/auth/reset?token=${raw}`;
      await this.email.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetUrl,
        minutes,
      );
    } else {
      // Equalise timing a bit — dummy bcrypt work.
      await bcrypt.hash(dto.email, 4);
    }
    return { message: FORGOT_GENERIC_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = sha256(dto.token);
    const row = await this.resetRepo.findOne({ where: { tokenHash } });
    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset link.');
    }

    // Constant-time hash equality for extra paranoia.
    const a = Buffer.from(tokenHash);
    const b = Buffer.from(row.tokenHash);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new BadRequestException('Invalid or expired reset link.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.users.updatePassword(row.userId, passwordHash);
    row.usedAt = new Date();
    await this.resetRepo.save(row);
    await this.tokens.revokeAllForUser(row.userId);
    return { message: 'Password updated. You can now sign in.' };
  }

  async me(userId: string) {
    const user = await this.users.findOne(userId);
    if (!user) throw new UnauthorizedException();
    const assignments = await this.userTenantRoles.findByUser(user.id);
    return {
      user: this.view(user),
      roles: assignments.map((a) => ({
        tenantId: a.tenantId,
        tenantCode: a.tenant?.code,
        tenantName: a.tenant?.name,
        roleId: a.roleId,
        roleName: a.role?.name,
        isPrimary: a.isPrimary,
      })),
    };
  }
}
