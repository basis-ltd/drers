import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Gender, ProfessionalTitle } from '../../common/enums';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';

@Entity('users')
export class User extends BaseDomain {
  @Index('idx_users_email', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Index('idx_users_phone', { unique: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({
    name: 'professional_title',
    type: 'enum',
    enum: ProfessionalTitle,
    nullable: true,
  })
  professionalTitle: ProfessionalTitle | null;

  @Column({ type: 'varchar', length: 100 })
  surname: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string | null;

  @Column({ name: 'national_id_passport', type: 'varchar', length: 100, nullable: true })
  nationalIdPassport: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'text', nullable: true })
  qualifications: string | null;

  @Column({ name: 'institutional_affiliation', type: 'varchar', length: 255, nullable: true })
  institutionalAffiliation: string | null;

  @Column({ name: 'physical_address', type: 'text', nullable: true })
  physicalAddress: string | null;

  @Column({ name: 'postal_address', type: 'text', nullable: true })
  postalAddress: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fax: string | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'otp_secret', type: 'varchar', length: 255, nullable: true, select: false })
  otpSecret: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => UserTenantRole, (utr) => utr.user)
  userTenantRoles: UserTenantRole[];
}
