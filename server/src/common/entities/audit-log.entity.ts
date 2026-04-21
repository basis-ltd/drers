import { Column, Entity, Index } from 'typeorm';
import { BaseDomain } from './base-domain.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditLayer } from '../enums/audit-layer.enum';

@Entity('audit_logs')
@Index('idx_audit_logs_entity', ['entityType', 'entityId', 'createdAt'])
@Index('idx_audit_logs_correlation', ['correlationId'])
@Index('idx_audit_logs_actor', ['createdById', 'createdAt'])
@Index('idx_audit_logs_tenant', ['tenantId', 'createdAt'])
export class AuditLog extends BaseDomain {
  @Column({ name: 'correlation_id', type: 'varchar', length: 128 })
  correlationId: string;

  @Column({ name: 'action', type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'layer', type: 'enum', enum: AuditLayer })
  layer: AuditLayer;

  @Column({ name: 'entity_type', type: 'varchar', length: 64, nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, unknown> | null;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, unknown> | null;

  @Column({ name: 'operation', type: 'varchar', length: 128, nullable: true })
  operation: string | null;

  @Column({ name: 'http_method', type: 'varchar', length: 16, nullable: true })
  httpMethod: string | null;

  @Column({ name: 'http_path', type: 'varchar', length: 2048, nullable: true })
  httpPath: string | null;

  @Column({ name: 'http_status', type: 'integer', nullable: true })
  httpStatus: number | null;

  @Column({ name: 'duration_ms', type: 'integer', nullable: true })
  durationMs: number | null;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'body_snapshot', type: 'jsonb', nullable: true })
  bodySnapshot: Record<string, unknown> | null;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
