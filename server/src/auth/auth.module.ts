import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { RolesModule } from '../roles/roles.module';
import { UserTenantRolesModule } from '../user-tenant-roles/user-tenant-roles.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensService } from './services/tokens.service';
import { EmailService } from './services/email.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([PasswordResetToken, RefreshToken]),
    UsersModule,
    TenantsModule,
    RolesModule,
    UserTenantRolesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    EmailService,
    JwtAccessStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
