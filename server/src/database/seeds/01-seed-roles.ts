import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { RoleName } from '../../common/enums';

const ROLES: Array<Pick<Role, 'name' | 'description' | 'isSystemRole'>> = [
  {
    name: RoleName.SYS_ADMIN,
    description: 'Full platform access across all tenants',
    isSystemRole: true,
  },
  {
    name: RoleName.RNEC_ADMIN,
    description: 'National-level administrator for RNEC operations',
    isSystemRole: true,
  },
  {
    name: RoleName.IRB_ADMIN,
    description: 'Institution-level administrator for IRB operations',
    isSystemRole: true,
  },
  {
    name: RoleName.CHAIRPERSON,
    description: 'Presides over committee meetings and approves decisions',
    isSystemRole: true,
  },
  {
    name: RoleName.REVIEWER,
    description: 'Reviews assigned research protocols',
    isSystemRole: true,
  },
  {
    name: RoleName.FINANCE,
    description: 'Manages fees, payments, invoices, and receipts',
    isSystemRole: true,
  },
  {
    name: RoleName.APPLICANT,
    description: 'Submits and tracks research ethics applications',
    isSystemRole: false,
  },
];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Role);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`  [roles] Skipping — ${existing} roles already exist`);
    return;
  }

  await repo.save(repo.create(ROLES));
  console.log(`  [roles] Seeded ${ROLES.length} roles`);
}
