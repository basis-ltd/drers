import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';

const BCRYPT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Test@123';

// One representative user per role / tenant combination.
// Emails follow the pattern <role>@zipflex.rw for easy identification in dev.
export const USER_SEEDS: Array<Pick<
  User,
  'email' | 'surname' | 'firstName' | 'isActive' | 'emailVerified'
>> = [
  // Super admin — cross-tenant platform owner
  { email: 'cto@zipflex.rw',             surname: 'Zipflex',   firstName: 'CTO',          isActive: true, emailVerified: true },
  // RNEC staff
  { email: 'rnec.admin@zipflex.rw',       surname: 'Nzeyimana', firstName: 'Admin',        isActive: true, emailVerified: true },
  { email: 'rnec.chairperson@zipflex.rw', surname: 'Hakizimana', firstName: 'Chairperson', isActive: true, emailVerified: true },
  { email: 'rnec.reviewer@zipflex.rw',    surname: 'Uwimana',   firstName: 'Reviewer',     isActive: true, emailVerified: true },
  { email: 'rnec.finance@zipflex.rw',     surname: 'Mukandori', firstName: 'Finance',      isActive: true, emailVerified: true },
  // IRB admins — one per institution
  { email: 'irb.ur@zipflex.rw',           surname: 'Bizimana',  firstName: 'UR Admin',     isActive: true, emailVerified: true },
  { email: 'irb.chuk@zipflex.rw',         surname: 'Uwase',     firstName: 'CHUK Admin',   isActive: true, emailVerified: true },
  { email: 'irb.rbc@zipflex.rw',          surname: 'Habimana',  firstName: 'RBC Admin',    isActive: true, emailVerified: true },
  // Applicant
  { email: 'applicant@zipflex.rw',        surname: 'Mugisha',   firstName: 'Applicant',    isActive: true, emailVerified: true },
];

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(User);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`  [users] Skipping — ${existing} users already exist`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  const users = USER_SEEDS.map((u) =>
    repo.create({ ...u, passwordHash }),
  );

  await repo.save(users);
  console.log(`  [users] Seeded ${users.length} users (password: ${DEFAULT_PASSWORD})`);
}
