import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Role } from '../../roles/entities/role.entity';

@Auditable()
@Entity('user_tenant_roles')
@Unique('uq_user_tenant_roles', ['userId', 'tenantId', 'roleId'])
export class UserTenantRole extends BaseDomain {
  @Index('idx_utr_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index('idx_utr_tenant_id')
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Index('idx_utr_role_id')
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.userTenantRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tenant, (tenant) => tenant.userTenantRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // RESTRICT: cannot delete a role that is actively assigned to users
  @ManyToOne(() => Role, (role) => role.userTenantRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
