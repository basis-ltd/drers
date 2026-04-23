import { Global, Module, OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../common/entities/audit-log.entity';
import { UserTenantRolesModule } from '../user-tenant-roles/user-tenant-roles.module';
import { AuditContextService } from './services/audit-context.service';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { AuditLogController } from './controllers/audit-log.controller';
import { registerAuditContextService } from './subscribers/audit-log.subscriber';
import { AuditAccessService } from './services/audit-access.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), UserTenantRolesModule],
  controllers: [AuditLogController],
  providers: [
    AuditContextService,
    AuditLogService,
    AuditAccessService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AuditContextService, AuditLogService, AuditAccessService],
})
export class AuditModule implements OnModuleInit {
  constructor(private readonly auditContext: AuditContextService) {}

  onModuleInit() {
    // Wire the AsyncLocalStorage-backed context to the subscriber, which is
    // instantiated by TypeORM (not Nest's DI container).
    registerAuditContextService(this.auditContext);
  }
}
