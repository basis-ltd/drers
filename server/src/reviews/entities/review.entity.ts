import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { Application } from '../../applications/entities/application.entity';
import { User } from '../../users/entities/user.entity';
import { ReviewStage } from '../enums/review-stage.enum';
import { ReviewerDecision } from '../enums/reviewer-decision.enum';
import { ChairDecision } from '../enums/chair-decision.enum';

@Auditable()
@Entity('reviews')
export class Review extends BaseDomain {
  @Index('idx_reviews_application_id', { unique: true })
  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({
    name: 'stage',
    type: 'enum',
    enum: ReviewStage,
    default: ReviewStage.PENDING_ASSIGNMENT,
  })
  stage: ReviewStage;

  @Index('idx_reviews_reviewer_id')
  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string | null;

  @Column({ name: 'assigned_by_id', type: 'uuid', nullable: true })
  assignedById: string | null;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt: Date | null;

  @Column({ name: 'due_at', type: 'timestamptz', nullable: true })
  dueAt: Date | null;

  @Column({
    name: 'reviewer_decision',
    type: 'enum',
    enum: ReviewerDecision,
    nullable: true,
  })
  reviewerDecision: ReviewerDecision | null;

  @Column({ name: 'reviewer_comments', type: 'text', nullable: true })
  reviewerComments: string | null;

  @Column({
    name: 'reviewer_submitted_at',
    type: 'timestamptz',
    nullable: true,
  })
  reviewerSubmittedAt: Date | null;

  @Column({
    name: 'chair_decision',
    type: 'enum',
    enum: ChairDecision,
    nullable: true,
  })
  chairDecision: ChairDecision | null;

  @Column({ name: 'chair_comments', type: 'text', nullable: true })
  chairComments: string | null;

  @Column({ name: 'chair_decided_at', type: 'timestamptz', nullable: true })
  chairDecidedAt: Date | null;

  @Column({ name: 'chair_decided_by_id', type: 'uuid', nullable: true })
  chairDecidedById: string | null;

  @OneToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'chair_decided_by_id' })
  chairDecidedBy: User | null;
}
