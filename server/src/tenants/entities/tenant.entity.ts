import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { TenantType } from '../../common/enums';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';

@Entity('tenants')
export class Tenant extends BaseDomain {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index('idx_tenants_code', { unique: true })
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'enum', enum: TenantType })
  type: TenantType;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, unknown> | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => UserTenantRole, (utr) => utr.tenant)
  userTenantRoles: UserTenantRole[];
}
