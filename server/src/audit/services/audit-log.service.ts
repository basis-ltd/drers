import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AuditLog } from '../../common/entities/audit-log.entity';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLayer } from '../../common/enums/audit-layer.enum';
import { AuditSortBy, AuditSortOrder } from '../dto/audit-log-query.dto';

export interface AuditLogQueryFilters {
  entityType?: string;
  entityTypes?: string[];
  entityId?: string;
  action?: AuditAction;
  actions?: AuditAction[];
  createdById?: string;
  tenantId?: string;
  tenantIds?: string[];
  correlationId?: string;
  layer?: AuditLayer;
  operation?: string;
  httpMethod?: string;
  httpStatus?: number;
  pathPrefix?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogQueryOptions {
  page?: number;
  size?: number;
  cursor?: string;
  limit?: number;
  sortBy?: AuditSortBy;
  sortOrder?: AuditSortOrder;
}

export interface Paginated<T> {
  items: T[];
  total?: number;
  page?: number;
  size?: number;
  totalPages?: number;
  nextCursor?: string | null;
  mode: 'offset' | 'cursor';
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async persist(row: Partial<AuditLog>): Promise<void> {
    try {
      await this.repo.save(this.repo.create(row));
    } catch (err) {
      this.logger.error(
        `Failed to persist audit row for ${row.entityType ?? 'HTTP'}:${row.entityId ?? '-'} (${row.action})`,
        err as Error,
      );
    }
  }

  async persistMany(rows: Array<Partial<AuditLog>>): Promise<void> {
    if (rows.length === 0) return;
    try {
      await this.repo.save(rows.map((r) => this.repo.create(r)));
    } catch (err) {
      this.logger.error(
        `Failed to persist ${rows.length} audit rows`,
        err as Error,
      );
    }
  }

  async fetchAuditLogs(
    filters: AuditLogQueryFilters,
    options: AuditLogQueryOptions,
  ): Promise<Paginated<AuditLog>> {
    if (options.cursor || options.limit) {
      return this.fetchAuditLogsByCursor(filters, options);
    }

    const page = options.page ?? 0;
    const size = options.size ?? 20;
    const sortBy = options.sortBy ?? AuditSortBy.CREATED_AT;
    const sortOrder =
      options.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.baseQuery(filters);
    this.applySort(qb, sortBy, sortOrder);
    qb.skip(page * size).take(size);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      size,
      totalPages: total > 0 ? Math.ceil(total / size) : 0,
      mode: 'offset',
    };
  }

  async fetchEntityHistory(
    entityType: string,
    entityId: string,
    filters: Omit<AuditLogQueryFilters, 'entityType' | 'entityId'>,
    options: AuditLogQueryOptions,
  ): Promise<Paginated<AuditLog>> {
    return this.fetchAuditLogs({ ...filters, entityType, entityId }, options);
  }

  async fetchById(
    id: string,
    filters: AuditLogQueryFilters,
  ): Promise<AuditLog | null> {
    const qb = this.baseQuery(filters);
    qb.andWhere('audit.id = :id', { id });
    return qb.getOne();
  }

  async fetchSummary(filters: AuditLogQueryFilters) {
    const raw = await this.baseQuery(filters)
      .select('COUNT(*)::int', 'totalEvents')
      .addSelect(
        `SUM(CASE WHEN audit.action = :httpAction THEN 1 ELSE 0 END)::int`,
        'httpEvents',
      )
      .addSelect(
        'SUM(CASE WHEN audit.httpStatus >= 400 THEN 1 ELSE 0 END)::int',
        'failedEvents',
      )
      .addSelect('COALESCE(AVG(audit.durationMs), 0)::float', 'avgDurationMs')
      .setParameter('httpAction', AuditAction.HTTP)
      .getRawOne<{
        totalEvents: number | string;
        httpEvents: number | string;
        failedEvents: number | string;
        avgDurationMs: number | string;
      }>();

    const totalEvents = Number(raw?.totalEvents ?? 0);
    const failedEvents = Number(raw?.failedEvents ?? 0);
    return {
      totalEvents,
      httpEvents: Number(raw?.httpEvents ?? 0),
      failedEvents,
      failureRate:
        totalEvents > 0 ? Number((failedEvents / totalEvents).toFixed(4)) : 0,
      avgDurationMs: Number(raw?.avgDurationMs ?? 0),
    };
  }

  async fetchActionStats(filters: AuditLogQueryFilters) {
    const rows = await this.baseQuery(filters)
      .select('audit.action', 'action')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .getRawMany<{ action: AuditAction; count: number | string }>();

    return rows.map((row) => ({
      action: row.action,
      count: Number(row.count),
    }));
  }

  async fetchEntityStats(filters: AuditLogQueryFilters, top = 10) {
    const rows = await this.baseQuery(filters)
      .andWhere('audit.entityType IS NOT NULL')
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('audit.entityType')
      .orderBy('count', 'DESC')
      .limit(top)
      .getRawMany<{ entityType: string; count: number | string }>();

    return rows.map((row) => ({
      entityType: row.entityType,
      count: Number(row.count),
    }));
  }

  async fetchHttpStatusStats(filters: AuditLogQueryFilters) {
    const rows = await this.baseQuery(filters)
      .andWhere('audit.httpStatus IS NOT NULL')
      .select('audit.httpStatus', 'httpStatus')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('audit.httpStatus')
      .orderBy('audit.httpStatus', 'ASC')
      .getRawMany<{ httpStatus: number | string; count: number | string }>();

    return rows.map((row) => ({
      httpStatus: Number(row.httpStatus),
      count: Number(row.count),
    }));
  }

  async exportAuditLogs(
    filters: AuditLogQueryFilters,
    maxRows = 5000,
  ): Promise<AuditLog[]> {
    return this.baseQuery(filters)
      .orderBy('audit.createdAt', 'DESC')
      .addOrderBy('audit.id', 'DESC')
      .limit(maxRows)
      .getMany();
  }

  private async fetchAuditLogsByCursor(
    filters: AuditLogQueryFilters,
    options: AuditLogQueryOptions,
  ): Promise<Paginated<AuditLog>> {
    const limit = options.limit ?? 20;
    const qb = this.baseQuery(filters);
    qb.orderBy('audit.createdAt', 'DESC').addOrderBy('audit.id', 'DESC');

    if (options.cursor) {
      const cursor = this.decodeCursor(options.cursor);
      qb.andWhere(
        '(audit.createdAt < :cursorCreatedAt OR (audit.createdAt = :cursorCreatedAt AND audit.id < :cursorId))',
        {
          cursorCreatedAt: cursor.createdAt,
          cursorId: cursor.id,
        },
      );
    }

    const rows = await qb.take(limit + 1).getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items,
      nextCursor: hasMore ? this.encodeCursor(items[items.length - 1]) : null,
      mode: 'cursor',
    };
  }

  private baseQuery(
    filters: AuditLogQueryFilters,
  ): SelectQueryBuilder<AuditLog> {
    const qb = this.repo.createQueryBuilder('audit');
    this.applyFilters(qb, filters);
    return qb;
  }

  private applySort(
    qb: SelectQueryBuilder<AuditLog>,
    sortBy: AuditSortBy,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    const allowedSortColumns: Record<AuditSortBy, string> = {
      [AuditSortBy.CREATED_AT]: 'audit.createdAt',
      [AuditSortBy.DURATION_MS]: 'audit.durationMs',
      [AuditSortBy.HTTP_STATUS]: 'audit.httpStatus',
    };
    const column = allowedSortColumns[sortBy] ?? 'audit.createdAt';
    qb.orderBy(column, sortOrder).addOrderBy('audit.id', sortOrder);
  }

  private applyFilters(
    qb: SelectQueryBuilder<AuditLog>,
    filters: AuditLogQueryFilters,
  ): void {
    if (filters.entityType)
      qb.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    if (filters.entityTypes?.length) {
      qb.andWhere('audit.entityType IN (:...entityTypes)', {
        entityTypes: filters.entityTypes,
      });
    }
    if (filters.entityId)
      qb.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
    if (filters.actions?.length) {
      qb.andWhere('audit.action IN (:...actions)', {
        actions: filters.actions,
      });
    } else if (filters.action) {
      qb.andWhere('audit.action = :action', { action: filters.action });
    }
    if (filters.createdById) {
      qb.andWhere('audit.createdById = :createdById', {
        createdById: filters.createdById,
      });
    }
    if (filters.tenantId) {
      qb.andWhere('audit.tenantId = :tenantId', { tenantId: filters.tenantId });
    } else if (filters.tenantIds?.length) {
      qb.andWhere('audit.tenantId IN (:...tenantIds)', {
        tenantIds: filters.tenantIds,
      });
    }
    if (filters.correlationId) {
      qb.andWhere('audit.correlationId = :correlationId', {
        correlationId: filters.correlationId,
      });
    }
    if (filters.layer)
      qb.andWhere('audit.layer = :layer', { layer: filters.layer });
    if (filters.operation) {
      qb.andWhere('audit.operation ILIKE :operation', {
        operation: `%${filters.operation}%`,
      });
    }
    if (filters.httpMethod) {
      qb.andWhere('audit.httpMethod = :httpMethod', {
        httpMethod: filters.httpMethod.toUpperCase(),
      });
    }
    if (filters.httpStatus) {
      qb.andWhere('audit.httpStatus = :httpStatus', {
        httpStatus: filters.httpStatus,
      });
    }
    if (filters.pathPrefix) {
      qb.andWhere('audit.httpPath ILIKE :pathPrefix', {
        pathPrefix: `${filters.pathPrefix}%`,
      });
    }
    if (filters.startDate) {
      qb.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      qb.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }
  }

  private decodeCursor(cursor: string): { createdAt: Date; id: string } {
    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as {
        createdAt: string;
        id: string;
      };
      if (!parsed?.createdAt || !parsed?.id) {
        throw new Error('invalid');
      }
      return { createdAt: new Date(parsed.createdAt), id: parsed.id };
    } catch {
      throw new BadRequestException('Invalid audit cursor.');
    }
  }

  private encodeCursor(row: AuditLog): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: row.createdAt.toISOString(),
        id: row.id,
      }),
      'utf8',
    ).toString('base64url');
  }
}
