import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AuditLog } from '../../common/entities/audit-log.entity';
import { AuditAction } from '../../common/enums/audit-action.enum';

export interface AuditLogQueryFilters {
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  createdById?: string;
  tenantId?: string;
  correlationId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogPagination {
  page?: number;
  size?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
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
    pagination: AuditLogPagination,
  ): Promise<Paginated<AuditLog>> {
    const { page = 0, size = 20 } = pagination;
    const where = this.buildWhere(filters);
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    return { items, total, page, size };
  }

  async fetchEntityHistory(
    entityType: string,
    entityId: string,
    filters: Omit<AuditLogQueryFilters, 'entityType' | 'entityId'>,
    pagination: AuditLogPagination,
  ): Promise<Paginated<AuditLog>> {
    return this.fetchAuditLogs(
      { ...filters, entityType, entityId },
      pagination,
    );
  }

  private buildWhere(filters: AuditLogQueryFilters): FindOptionsWhere<AuditLog> {
    const where: FindOptionsWhere<AuditLog> = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.createdById) where.createdById = filters.createdById;
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.correlationId) where.correlationId = filters.correlationId;

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    return where;
  }
}
