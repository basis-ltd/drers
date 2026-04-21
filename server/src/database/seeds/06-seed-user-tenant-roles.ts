import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';
import { RoleName } from '../../common/enums';

// Maps each seeded user email → { tenantCode, roleName, isPrimary }
const ASSIGNMENTS: Array<{
  email: string;
  tenantCode: string;
  roleName: RoleName;
  isPrimary: boolean;
}> = [
  // Super admin belongs to RNEC as SYS_ADMIN
  {
    email: 'cto@zipflex.rw',
    tenantCode: 'RNEC',
    roleName: RoleName.SYS_ADMIN,
    isPrimary: true,
  },
  // RNEC staff
  {
    email: 'rnec.admin@zipflex.rw',
    tenantCode: 'RNEC',
    roleName: RoleName.RNEC_ADMIN,
    isPrimary: true,
  },
  {
    email: 'rnec.chairperson@zipflex.rw',
    tenantCode: 'RNEC',
    roleName: RoleName.CHAIRPERSON,
    isPrimary: true,
  },
  {
    email: 'rnec.reviewer@zipflex.rw',
    tenantCode: 'RNEC',
    roleName: RoleName.REVIEWER,
    isPrimary: true,
  },
  {
    email: 'rnec.finance@zipflex.rw',
    tenantCode: 'RNEC',
    roleName: RoleName.FINANCE,
    isPrimary: true,
  },
  // IRB admins — each in their own institution
  {
    email: 'irb.ur@zipflex.rw',
    tenantCode: 'UR_IRB',
    roleName: RoleName.IRB_ADMIN,
    isPrimary: true,
  },
  {
    email: 'irb.chuk@zipflex.rw',
    tenantCode: 'CHUK_IRB',
    roleName: RoleName.IRB_ADMIN,
    isPrimary: true,
  },
  {
    email: 'irb.rbc@zipflex.rw',
    tenantCode: 'RBC_IRB',
    roleName: RoleName.IRB_ADMIN,
    isPrimary: true,
  },
  // Applicant submits to RNEC
  {
    email: 'applicant@zipflex.rw',
    tenantCode: 'RNEC',
    roleName: RoleName.APPLICANT,
    isPrimary: true,
  },
];

export async function seedUserTenantRoles(
  dataSource: DataSource,
): Promise<void> {
  const utrRepo = dataSource.getRepository(UserTenantRole);

  const existing = await utrRepo.count();
  if (existing > 0) {
    console.log(
      `  [user_tenant_roles] Skipping — ${existing} assignments already exist`,
    );
    return;
  }

  const userRepo = dataSource.getRepository(User);
  const tenantRepo = dataSource.getRepository(Tenant);
  const roleRepo = dataSource.getRepository(Role);

  const [users, tenants, roles] = await Promise.all([
    userRepo.find(),
    tenantRepo.find(),
    roleRepo.find(),
  ]);

  const userMap = new Map(users.map((u) => [u.email, u]));
  const tenantMap = new Map(tenants.map((t) => [t.code, t]));
  const roleMap = new Map(roles.map((r) => [r.name, r]));

  const entries: Partial<UserTenantRole>[] = [];

  for (const a of ASSIGNMENTS) {
    const user = userMap.get(a.email);
    const tenant = tenantMap.get(a.tenantCode);
    const role = roleMap.get(a.roleName);

    if (!user)
      throw new Error(`User not found: ${a.email} — run users seed first`);
    if (!tenant)
      throw new Error(
        `Tenant not found: ${a.tenantCode} — run tenants seed first`,
      );
    if (!role)
      throw new Error(`Role not found: ${a.roleName} — run roles seed first`);

    entries.push({
      userId: user.id,
      tenantId: tenant.id,
      roleId: role.id,
      isPrimary: a.isPrimary,
      isActive: true,
    });
  }

  await utrRepo.save(utrRepo.create(entries));
  console.log(`  [user_tenant_roles] Seeded ${entries.length} assignments`);
}
