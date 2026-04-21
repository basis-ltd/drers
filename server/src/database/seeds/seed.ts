import 'reflect-metadata';
import type { DataSource } from 'typeorm';

import { AppDataSource } from '../../../data-source';

import { seedRoles } from './01-seed-roles';
import { seedPermissions } from './02-seed-permissions';
import { seedRolePermissions } from './03-seed-role-permissions';
import { seedTenants } from './04-seed-tenants';
import { seedUsers } from './05-seed-users';
import { seedUserTenantRoles } from './06-seed-user-tenant-roles';

// Seeds run in dependency order. Each seed is idempotent — it self-skips if
// its table already has data. Add new seeds here to keep the runner canonical.
const SEEDS: Array<{ name: string; run: (ds: DataSource) => Promise<void> }> = [
  { name: '01-roles', run: seedRoles },
  { name: '02-permissions', run: seedPermissions },
  { name: '03-role-permissions', run: seedRolePermissions },
  { name: '04-tenants', run: seedTenants },
  { name: '05-users', run: seedUsers },
  { name: '06-user-tenant-roles', run: seedUserTenantRoles },
];

async function runSeeds(): Promise<void> {
  console.log('Connecting to database…');
  await AppDataSource.initialize();
  console.log('Connected.\n');

  for (const seed of SEEDS) {
    process.stdout.write(`Running seed: ${seed.name}\n`);
    await seed.run(AppDataSource);
  }

  console.log('\nAll seeds complete.');
}

runSeeds()
  .catch((err) => {
    console.error('Seed runner failed:', err);
    process.exit(1);
  })
  .finally(() => AppDataSource.destroy());
