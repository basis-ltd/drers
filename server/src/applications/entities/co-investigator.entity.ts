import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Application } from './application.entity';
import { ProfessionalTitle } from '../../common/enums/professional-title.enum';

@Entity('co_investigators')
export class CoInvestigator extends BaseDomain {
  @Index('idx_co_inv_application_id')
  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({
    name: 'title',
    type: 'enum',
    enum: ProfessionalTitle,
    nullable: true,
  })
  title: ProfessionalTitle | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'institution', type: 'varchar', length: 255, nullable: true })
  institution: string | null;

  @Column({ name: 'role', type: 'varchar', length: 255, nullable: true })
  role: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Application, (a) => a.coInvestigators, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
