import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { UserTenantRole } from '../user-tenant-roles/entities/user-tenant-role.entity';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationDetails } from '../applications/entities/application-details.entity';
import { ApplicationTeam } from '../applications/entities/application-team.entity';
import { CoInvestigator } from '../applications/entities/co-investigator.entity';
import { StudySite } from '../applications/entities/study-site.entity';
import { ApplicationProtocol } from '../applications/entities/application-protocol.entity';
import { ApplicationEthics } from '../applications/entities/application-ethics.entity';
import { ApplicationDeclaration } from '../applications/entities/application-declaration.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [
          Tenant,
          User,
          Role,
          Permission,
          RolePermission,
          UserTenantRole,
          PasswordResetToken,
          RefreshToken,
          Application,
          ApplicationDetails,
          ApplicationTeam,
          CoInvestigator,
          StudySite,
          ApplicationProtocol,
          ApplicationEthics,
          ApplicationDeclaration,
          Document,
        ],
        migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
        synchronize: true,
        logging: config.get<string>('NODE_ENV') !== 'production',
        migrationsRun: false,
        ssl:
          config.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
