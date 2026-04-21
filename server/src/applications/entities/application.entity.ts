import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicationType } from '../enums/application-type.enum';
import { ApplicationDetails } from './application-details.entity';
import { ApplicationTeam } from './application-team.entity';
import { ApplicationProtocol } from './application-protocol.entity';
import { ApplicationEthics } from './application-ethics.entity';
import { ApplicationDeclaration } from './application-declaration.entity';
import { CoInvestigator } from './co-investigator.entity';
import { StudySite } from './study-site.entity';

@Entity('applications')
export class Application extends BaseDomain {
  @Column({ name: 'reference_number', type: 'varchar', length: 20, unique: true })
  referenceNumber: string;

  @Index('idx_applications_applicant_id')
  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string;

  @Index('idx_applications_tenant_id')
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'type', type: 'enum', enum: ApplicationType })
  type: ApplicationType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({ name: 'version_number', type: 'integer', default: 1 })
  versionNumber: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'decision_at', type: 'timestamptz', nullable: true })
  decisionAt: Date | null;

  @Index('idx_applications_parent_id')
  @Column({ name: 'parent_application_id', type: 'uuid', nullable: true })
  parentApplicationId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'parent_application_id' })
  parentApplication: Application | null;

  @OneToOne(() => ApplicationDetails, (d) => d.application)
  details: ApplicationDetails | null;

  @OneToOne(() => ApplicationTeam, (t) => t.application)
  team: ApplicationTeam | null;

  @OneToOne(() => ApplicationProtocol, (p) => p.application)
  protocol: ApplicationProtocol | null;

  @OneToOne(() => ApplicationEthics, (e) => e.application)
  ethics: ApplicationEthics | null;

  @OneToOne(() => ApplicationDeclaration, (d) => d.application)
  declaration: ApplicationDeclaration | null;

  @OneToMany(() => CoInvestigator, (c) => c.application)
  coInvestigators: CoInvestigator[];

  @OneToMany(() => StudySite, (s) => s.application)
  studySites: StudySite[];
}
