import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: true } });
  }

  findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.emailVerificationTokenHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByEmailVerificationTokenHash(tokenHash: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.emailVerificationTokenHash')
      .where('user.emailVerificationTokenHash = :tokenHash', { tokenHash })
      .getOne();
  }

  create(data: DeepPartial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { passwordHash });
  }

  async setEmailVerificationToken(
    userId: string,
    tokenHash: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: expiresAt },
    );
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    );
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { lastLoginAt: new Date() });
  }
}
