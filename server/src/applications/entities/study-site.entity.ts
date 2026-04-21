import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Application } from './application.entity';

@Entity('study_sites')
export class StudySite extends BaseDomain {
  @Index('idx_study_site_application_id')
  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Application, (a) => a.studySites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
