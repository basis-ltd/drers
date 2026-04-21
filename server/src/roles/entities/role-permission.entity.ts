import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Auditable()
@Entity('role_permissions')
@Unique('uq_role_permissions', ['roleId', 'permissionId'])
export class RolePermission extends BaseDomain {
  @Index('idx_role_permissions_role_id')
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Index('idx_role_permissions_permission_id')
  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
