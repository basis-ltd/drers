import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission extends BaseDomain {
  @Index('idx_permissions_code', { unique: true })
  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index('idx_permissions_module')
  @Column({ type: 'varchar', length: 100 })
  module: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[];
}
