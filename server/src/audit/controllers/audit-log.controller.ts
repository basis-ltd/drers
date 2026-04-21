import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtUser } from '../../auth/decorators/current-user.decorator';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async list(@Query() query: AuditLogQueryDto, @CurrentUser() user: JwtUser) {
    return this.auditLogService.fetchAuditLogs(
      {
        entityType: query.entityType,
        entityId: query.entityId,
        action: query.action,
        createdById: query.createdById ?? user.sub,
        tenantId: query.tenantId,
        correlationId: query.correlationId,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      { page: query.page, size: query.size },
    );
  }

  @Get('entity/:entityType/:entityId')
  async history(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditLogService.fetchEntityHistory(
      entityType,
      entityId,
      {
        action: query.action,
        createdById: query.createdById,
        tenantId: query.tenantId,
        correlationId: query.correlationId,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      { page: query.page, size: query.size },
    );
  }
}
