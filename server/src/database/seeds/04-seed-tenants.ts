import { DataSource } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { TenantType } from '../../common/enums';

export const TENANTS: Array<Pick<Tenant, 'name' | 'code' | 'type' | 'description' | 'isActive'>> = [
  {
    name: 'Rwanda National Ethics Committee',
    code: 'RNEC',
    type: TenantType.RNEC,
    description: 'National-level research ethics oversight body for Rwanda',
    isActive: true,
  },
  {
    name: 'University of Rwanda IRB',
    code: 'UR_IRB',
    type: TenantType.IRB,
    description: 'Institutional Review Board of the University of Rwanda',
    isActive: true,
  },
  {
    name: 'Centre Hospitalier Universitaire de Kigali IRB',
    code: 'CHUK_IRB',
    type: TenantType.IRB,
    description: 'Institutional Review Board of CHUK',
    isActive: true,
  },
  {
    name: 'Rwanda Biomedical Centre IRB',
    code: 'RBC_IRB',
    type: TenantType.IRB,
    description: 'Institutional Review Board of the Rwanda Biomedical Centre',
    isActive: true,
  },
];

export async function seedTenants(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Tenant);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`  [tenants] Skipping — ${existing} tenants already exist`);
    return;
  }

  await repo.save(repo.create(TENANTS));
  console.log(`  [tenants] Seeded ${TENANTS.length} tenants`);
}
