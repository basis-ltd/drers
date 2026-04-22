import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { Application } from './application.entity';

@Auditable()
@Entity('application_team')
export class ApplicationTeam extends BaseDomain {
  @Index('idx_app_team_application_id')
  @Column({ name: 'application_id', type: 'uuid', unique: true })
  applicationId: string;

  @Column({
    name: 'pi_department',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  piDepartment: string | null;

  @Column({
    name: 'pi_institution',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  piInstitution: string | null;

  @Column({ name: 'pi_phone', type: 'varchar', length: 50, nullable: true })
  piPhone: string | null;

  @Column({ name: 'pi_nhra', type: 'varchar', length: 100, nullable: true })
  piNhra: string | null;

  @OneToOne(() => Application, (a) => a.team)
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
