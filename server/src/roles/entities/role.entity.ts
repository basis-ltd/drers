import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { RoleName } from '../../common/enums';
import { RolePermission } from './role-permission.entity';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';

@Auditable()
@Entity('roles')
export class Role extends BaseDomain {
  @Index('idx_roles_name', { unique: true })
  @Column({ type: 'enum', enum: RoleName })
  name: RoleName;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_system_role', type: 'boolean', default: false })
  isSystemRole: boolean;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserTenantRole, (utr) => utr.role)
  userTenantRoles: UserTenantRole[];
}
