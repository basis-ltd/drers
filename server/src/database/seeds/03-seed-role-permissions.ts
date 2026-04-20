import { DataSource, In } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../roles/entities/permission.entity';
import { RolePermission } from '../../roles/entities/role-permission.entity';
import { RoleName } from '../../common/enums';

// Permissions granted per role. Codes must match 02-seed-permissions.ts exactly.
const ROLE_PERMISSION_MAP: Record<RoleName, string[]> = {
  [RoleName.SYS_ADMIN]: [
    'applications:create', 'applications:read', 'applications:update', 'applications:delete', 'applications:submit', 'applications:withdraw',
    'reviews:read', 'reviews:assign', 'reviews:submit', 'reviews:complete',
    'payments:read', 'payments:manage',
    'certificates:read', 'certificates:generate',
    'meetings:read', 'meetings:manage',
    'monitoring:read', 'monitoring:update',
    'users:read', 'users:manage',
    'tenants:read', 'tenants:manage',
    'reports:view', 'reports:export',
    'settings:read', 'settings:manage',
  ],
  [RoleName.RNEC_ADMIN]: [
    'applications:read', 'applications:update', 'applications:delete', 'applications:withdraw',
    'reviews:read', 'reviews:assign', 'reviews:submit', 'reviews:complete',
    'payments:read', 'payments:manage',
    'certificates:read', 'certificates:generate',
    'meetings:read', 'meetings:manage',
    'monitoring:read', 'monitoring:update',
    'users:read', 'users:manage',
    'tenants:read',
    'reports:view', 'reports:export',
    'settings:read', 'settings:manage',
  ],
  [RoleName.IRB_ADMIN]: [
    'applications:read', 'applications:update', 'applications:delete', 'applications:withdraw',
    'reviews:read', 'reviews:assign', 'reviews:submit', 'reviews:complete',
    'payments:read',
    'certificates:read', 'certificates:generate',
    'meetings:read', 'meetings:manage',
    'monitoring:read', 'monitoring:update',
    'users:read', 'users:manage',
    'tenants:read',
    'reports:view', 'reports:export',
    'settings:read', 'settings:manage',
  ],
  [RoleName.CHAIRPERSON]: [
    'applications:read',
    'reviews:read', 'reviews:assign', 'reviews:submit', 'reviews:complete',
    'payments:read',
    'certificates:read', 'certificates:generate',
    'meetings:read', 'meetings:manage',
    'monitoring:read',
    'users:read',
    'tenants:read',
    'reports:view', 'reports:export',
    'settings:read',
  ],
  [RoleName.REVIEWER]: [
    'applications:read',
    'reviews:read', 'reviews:submit', 'reviews:complete',
    'monitoring:read',
  ],
  [RoleName.FINANCE]: [
    'applications:read',
    'payments:read', 'payments:manage',
    'reports:view', 'reports:export',
  ],
  [RoleName.APPLICANT]: [
    'applications:create', 'applications:read', 'applications:update', 'applications:submit', 'applications:withdraw',
    'payments:read',
    'certificates:read',
    'monitoring:read', 'monitoring:update',
  ],
};

export async function seedRolePermissions(dataSource: DataSource): Promise<void> {
  const rpRepo = dataSource.getRepository(RolePermission);

  const existing = await rpRepo.count();
  if (existing > 0) {
    console.log(`  [role_permissions] Skipping — ${existing} mappings already exist`);
    return;
  }

  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);

  const [roles, permissions] = await Promise.all([
    roleRepo.find(),
    permRepo.find(),
  ]);

  const roleMap = new Map(roles.map((r) => [r.name, r]));
  const permMap = new Map(permissions.map((p) => [p.code, p]));

  const entries: Partial<RolePermission>[] = [];

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSION_MAP) as [RoleName, string[]][]) {
    const role = roleMap.get(roleName);
    if (!role) throw new Error(`Role not found: ${roleName} — run roles seed first`);

    for (const code of codes) {
      const perm = permMap.get(code);
      if (!perm) throw new Error(`Permission not found: ${code} — run permissions seed first`);
      entries.push({ roleId: role.id, permissionId: perm.id });
    }
  }

  await rpRepo.save(rpRepo.create(entries));
  console.log(`  [role_permissions] Seeded ${entries.length} mappings`);
}
