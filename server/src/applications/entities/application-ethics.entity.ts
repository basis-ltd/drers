import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { Application } from './application.entity';
import { ConsentWaiver } from '../enums/consent-waiver.enum';
import { ConflictOfInterest } from '../enums/conflict-of-interest.enum';

@Auditable()
@Entity('application_ethics')
export class ApplicationEthics extends BaseDomain {
  @Index('idx_app_ethics_application_id')
  @Column({ name: 'application_id', type: 'uuid', unique: true })
  applicationId: string;

  @Column({ name: 'risks', type: 'text', nullable: true })
  risks: string | null;

  @Column({ name: 'risk_mitigation', type: 'text', nullable: true })
  riskMitigation: string | null;

  @Column({ name: 'benefits', type: 'text', nullable: true })
  benefits: string | null;

  // jsonb preserves the string[] correctly without comma-split ambiguity
  @Column({ name: 'vulnerable_populations', type: 'jsonb', nullable: true })
  vulnerablePopulations: string[] | null;

  @Column({ name: 'consent_process', type: 'text', nullable: true })
  consentProcess: string | null;

  @Column({
    name: 'consent_waiver',
    type: 'enum',
    enum: ConsentWaiver,
    nullable: true,
  })
  consentWaiver: ConsentWaiver | null;

  @Column({
    name: 'consent_waiver_justification',
    type: 'text',
    nullable: true,
  })
  consentWaiverJustification: string | null;

  @Column({ name: 'data_storage', type: 'text', nullable: true })
  dataStorage: string | null;

  @Column({ name: 'confidentiality', type: 'text', nullable: true })
  confidentiality: string | null;

  @Column({
    name: 'conflict_of_interest',
    type: 'enum',
    enum: ConflictOfInterest,
    nullable: true,
  })
  conflictOfInterest: ConflictOfInterest | null;

  @Column({
    name: 'conflict_of_interest_description',
    type: 'text',
    nullable: true,
  })
  conflictOfInterestDescription: string | null;

  @OneToOne(() => Application, (a) => a.ethics)
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
