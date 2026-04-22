import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLayer } from '../../common/enums/audit-layer.enum';
import { AuditLog } from '../../common/entities/audit-log.entity';
import {
  isAuditable,
  getAuditEntityType,
} from '../decorators/auditable.decorator';
import { AuditContextService } from '../services/audit-context.service';
import {
  buildCreateDiff,
  buildDeleteDiff,
  buildUpdateDiff,
} from '../helpers/audit-diff.helper';

/**
 * Singleton context holder — the subscriber is registered with TypeORM by
 * class reference (no DI), so it reads the request-scoped context through
 * the statically-registered AuditContextService instance.
 */
let contextService: AuditContextService | null = null;

export function registerAuditContextService(
  service: AuditContextService,
): void {
  contextService = service;
}

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface<object> {
  private ctx(): AuditContextService | null {
    return contextService;
  }

  private shouldAudit(target: unknown): target is Function {
    if (typeof target !== 'function') return false;
    if (target === AuditLog) return false;
    return isAuditable(target);
  }

  private entityTenantId(entity: unknown): string | null {
    if (!entity || typeof entity !== 'object') return null;
    const value = (entity as Record<string, unknown>).tenantId;
    return typeof value === 'string' ? value : null;
  }

  private entityId(entity: unknown): string | null {
    if (!entity || typeof entity !== 'object') return null;
    const value = (entity as Record<string, unknown>).id;
    return typeof value === 'string' ? value : null;
  }

  afterInsert(event: InsertEvent<object>): void {
    const target = event.metadata.target;
    if (!this.shouldAudit(target)) return;
    const ctx = this.ctx();
    if (!ctx?.get()) return;

    const { oldValues, newValues } = buildCreateDiff(event.entity);
    ctx.pushPending({
      action: AuditAction.CREATE,
      layer: AuditLayer.REPOSITORY,
      entityType: getAuditEntityType(target),
      entityId: this.entityId(event.entity),
      oldValues,
      newValues,
      tenantId: this.entityTenantId(event.entity),
    });
  }

  afterUpdate(event: UpdateEvent<object>): void {
    const target = event.metadata.target;
    if (!this.shouldAudit(target)) return;
    const ctx = this.ctx();
    if (!ctx?.get()) return;

    const before = (event.databaseEntity as Record<string, unknown>) ?? null;
    const after = (event.entity as Record<string, unknown>) ?? null;
    const { oldValues, newValues } = buildUpdateDiff(before, after);

    if (!newValues && !oldValues) return;

    ctx.pushPending({
      action: AuditAction.UPDATE,
      layer: AuditLayer.REPOSITORY,
      entityType: getAuditEntityType(target),
      entityId: this.entityId(event.entity ?? event.databaseEntity),
      oldValues,
      newValues,
      tenantId:
        this.entityTenantId(event.entity) ??
        this.entityTenantId(event.databaseEntity),
    });
  }

  afterRemove(event: RemoveEvent<object>): void {
    const target = event.metadata.target;
    if (!this.shouldAudit(target)) return;
    const ctx = this.ctx();
    if (!ctx?.get()) return;

    const subject = event.databaseEntity ?? event.entity;
    const { oldValues, newValues } = buildDeleteDiff(subject);
    ctx.pushPending({
      action: AuditAction.DELETE,
      layer: AuditLayer.REPOSITORY,
      entityType: getAuditEntityType(target),
      entityId: this.entityId(subject),
      oldValues,
      newValues,
      tenantId: this.entityTenantId(subject),
    });
  }
}
