import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtUser } from '../../auth/decorators/current-user.decorator';
import { AuditLog } from '../../common/entities/audit-log.entity';
import {
  AuditLogService,
  type AuditLogQueryFilters,
  type AuditLogQueryOptions,
} from '../services/audit-log.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';
import { AuditAccessService } from '../services/audit-access.service';

type HttpStatusStat = { httpStatus: number; count: number };

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly auditAccessService: AuditAccessService,
  ) {}

  @Get()
  async list(@Query() query: AuditLogQueryDto, @CurrentUser() user: JwtUser) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    return this.auditLogService.fetchAuditLogs(
      this.buildFilters(query, scope),
      this.buildQueryOptions(query),
    );
  }

  @Get('summary')
  async summary(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    if (!scope.isPrivileged) {
      await this.auditAccessService.ensurePrivileged(user);
    }
    return this.auditLogService.fetchSummary(this.buildFilters(query, scope));
  }

  @Get('stats/actions')
  async actionStats(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    if (!scope.isPrivileged) {
      await this.auditAccessService.ensurePrivileged(user);
    }
    return this.auditLogService.fetchActionStats(
      this.buildFilters(query, scope),
    );
  }

  @Get('stats/entities')
  async entityStats(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    if (!scope.isPrivileged) {
      await this.auditAccessService.ensurePrivileged(user);
    }
    return this.auditLogService.fetchEntityStats(
      this.buildFilters(query, scope),
      query.top,
    );
  }

  @Get('stats/http-status')
  async httpStatusStats(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<HttpStatusStat[]> {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    if (!scope.isPrivileged) {
      await this.auditAccessService.ensurePrivileged(user);
    }
    const filters: AuditLogQueryFilters = this.buildFilters(query, scope);
    const stats: HttpStatusStat[] =
      await this.auditLogService.fetchHttpStatusStats(filters);
    return stats;
  }

  @Get('export')
  async export(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
    @Res() res: Response,
  ) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    if (!scope.isPrivileged) {
      await this.auditAccessService.ensurePrivileged(user);
    }

    const rows = await this.auditLogService.exportAuditLogs(
      this.buildFilters(query, scope),
    );
    const csv = this.toCsv(rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString()}.csv"`,
    );
    res.send(csv);
  }

  @Get('entity/:entityType/:entityId')
  async history(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    return this.auditLogService.fetchEntityHistory(
      entityType,
      entityId,
      this.buildFilters(query, scope),
      this.buildQueryOptions(query),
    );
  }

  @Get(':id')
  async byId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    const scope = await this.auditAccessService.buildScope(user, {
      createdById: query.createdById,
      tenantId: query.tenantId,
    });
    return this.auditLogService.fetchById(id, this.buildFilters(query, scope));
  }

  private buildFilters(
    query: AuditLogQueryDto,
    scope: {
      createdById?: string;
      tenantId?: string;
      tenantIds?: string[];
    },
  ): AuditLogQueryFilters {
    const operation: string | undefined = query.operation;
    const httpMethod: string | undefined = query.httpMethod;
    const httpStatus: number | undefined = query.httpStatus;
    const pathPrefix: string | undefined = query.pathPrefix;
    const startDate: Date | undefined = query.startDate;
    const endDate: Date | undefined = query.endDate;

    return {
      entityType: query.entityType,
      entityTypes: query.entityTypes,
      entityId: query.entityId,
      action: query.action,
      actions: query.actions,
      createdById: scope.createdById ?? query.createdById,
      tenantId: scope.tenantId ?? query.tenantId,
      tenantIds: scope.tenantIds,
      correlationId: query.correlationId,
      layer: query.layer,
      operation,
      httpMethod,
      httpStatus,
      pathPrefix,
      startDate,
      endDate,
    };
  }

  private buildQueryOptions(query: AuditLogQueryDto) {
    return {
      page: query.page,
      size: query.size,
      cursor: query.cursor,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    } satisfies AuditLogQueryOptions;
  }

  private toCsv(rows: AuditLog[]): string {
    const headers = [
      'id',
      'createdAt',
      'createdById',
      'tenantId',
      'action',
      'layer',
      'entityType',
      'entityId',
      'operation',
      'httpMethod',
      'httpPath',
      'httpStatus',
      'durationMs',
      'correlationId',
      'ip',
      'userAgent',
      'oldValues',
      'newValues',
      'bodySnapshot',
      'querySnapshot',
      'metadata',
    ];
    const lines = rows.map((row) =>
      [
        row.id,
        row.createdAt,
        row.createdById,
        row.tenantId,
        row.action,
        row.layer,
        row.entityType,
        row.entityId,
        row.operation,
        row.httpMethod,
        row.httpPath,
        row.httpStatus,
        row.durationMs,
        row.correlationId,
        row.ip,
        row.userAgent,
        row.oldValues,
        row.newValues,
        row.bodySnapshot,
        row.querySnapshot,
        row.metadata,
      ]
        .map((value) => this.toCsvValue(value))
        .join(','),
    );
    return [headers.join(','), ...lines].join('\n');
  }

  private toCsvValue(value: unknown): string {
    if (value === null || value === undefined) return '""';
    const printable =
      value instanceof Date
        ? value.toISOString()
        : typeof value === 'object'
          ? JSON.stringify(value)
          : typeof value === 'string'
            ? value
            : typeof value === 'number' ||
                typeof value === 'boolean' ||
                typeof value === 'bigint'
              ? String(value)
              : typeof value === 'symbol'
                ? (value.description ?? 'symbol')
                : '';
    return `"${printable.replace(/"/g, '""')}"`;
  }
}
