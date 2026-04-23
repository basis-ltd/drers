import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLayer } from '../../common/enums/audit-layer.enum';

export interface PendingAuditRow {
  action: AuditAction;
  layer: AuditLayer;
  entityType: string | null;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  operation?: string | null;
  tenantId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditStore {
  correlationId: string;
  userId: string | null;
  tenantId: string | null;
  ip: string | null;
  userAgent: string | null;
  httpMethod: string;
  httpPath: string;
  startedAt: number;
  bodySnapshot: Record<string, unknown> | null;
  querySnapshot: Record<string, unknown> | null;
  pendingRows: PendingAuditRow[];
  currentOperation: string | null;
}

@Injectable()
export class AuditContextService {
  private readonly storage = new AsyncLocalStorage<AuditStore>();

  run<T>(store: AuditStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  get(): AuditStore | undefined {
    return this.storage.getStore();
  }

  setUserId(userId: string | null | undefined): void {
    const store = this.storage.getStore();
    if (store) store.userId = userId ?? null;
  }

  setTenantId(tenantId: string | null | undefined): void {
    const store = this.storage.getStore();
    if (store && !store.tenantId) store.tenantId = tenantId ?? null;
  }

  setOperation(operation: string | null | undefined): void {
    const store = this.storage.getStore();
    if (store) store.currentOperation = operation ?? null;
  }

  pushPending(row: PendingAuditRow): void {
    const store = this.storage.getStore();
    if (!store) return;
    const enriched: PendingAuditRow = {
      ...row,
      operation: row.operation ?? store.currentOperation ?? null,
      tenantId: row.tenantId ?? store.tenantId ?? null,
    };
    store.pendingRows.push(enriched);
  }

  drainPending(): PendingAuditRow[] {
    const store = this.storage.getStore();
    if (!store) return [];
    const rows = store.pendingRows;
    store.pendingRows = [];
    return rows;
  }
}
