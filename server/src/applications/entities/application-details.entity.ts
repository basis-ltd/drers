import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Application } from './application.entity';
import { ResearchArea } from '../enums/research-area.enum';
import { StudyType } from '../enums/study-type.enum';
import { ReviewPathway } from '../enums/review-pathway.enum';

@Entity('application_details')
export class ApplicationDetails extends BaseDomain {
  @Index('idx_app_details_application_id')
  @Column({ name: 'application_id', type: 'uuid', unique: true })
  applicationId: string;

  @Column({ name: 'title', type: 'varchar', length: 500, nullable: true })
  title: string | null;

  @Column({ name: 'area', type: 'enum', enum: ResearchArea, nullable: true })
  area: ResearchArea | null;

  @Column({ name: 'funding', type: 'varchar', length: 255, nullable: true })
  funding: string | null;

  @Column({ name: 'study_type', type: 'enum', enum: StudyType, nullable: true })
  studyType: StudyType | null;

  @Column({ name: 'pathway', type: 'enum', enum: ReviewPathway, nullable: true })
  pathway: ReviewPathway | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ name: 'multi_centre', type: 'boolean', default: false })
  multiCentre: boolean;

  @OneToOne(() => Application, (a) => a.details)
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
