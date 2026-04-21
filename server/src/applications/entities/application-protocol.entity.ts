import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { Application } from './application.entity';
import { StudyDesign } from '../enums/study-design.enum';

@Auditable()
@Entity('application_protocols')
export class ApplicationProtocol extends BaseDomain {
  @Index('idx_app_protocol_application_id')
  @Column({ name: 'application_id', type: 'uuid', unique: true })
  applicationId: string;

  @Column({ name: 'background', type: 'text', nullable: true })
  background: string | null;

  @Column({ name: 'primary_objective', type: 'text', nullable: true })
  primaryObjective: string | null;

  @Column({ name: 'secondary_objectives', type: 'text', nullable: true })
  secondaryObjectives: string | null;

  @Column({ name: 'design', type: 'enum', enum: StudyDesign, nullable: true })
  design: StudyDesign | null;

  @Column({ name: 'duration', type: 'varchar', length: 255, nullable: true })
  duration: string | null;

  @Column({ name: 'sample_size', type: 'integer', nullable: true })
  sampleSize: number | null;

  @Column({ name: 'stat_power', type: 'varchar', length: 255, nullable: true })
  statPower: string | null;

  @Column({ name: 'population', type: 'text', nullable: true })
  population: string | null;

  @Column({ name: 'inclusion_criteria', type: 'text', nullable: true })
  inclusionCriteria: string | null;

  @Column({ name: 'exclusion_criteria', type: 'text', nullable: true })
  exclusionCriteria: string | null;

  @Column({ name: 'recruitment', type: 'text', nullable: true })
  recruitment: string | null;

  @Column({ name: 'procedures', type: 'text', nullable: true })
  procedures: string | null;

  @OneToOne(() => Application, (a) => a.protocol)
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
