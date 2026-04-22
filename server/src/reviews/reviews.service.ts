import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';
import { ReviewStage } from './enums/review-stage.enum';
import { ReviewerDecision } from './enums/reviewer-decision.enum';
import { ChairDecision } from './enums/chair-decision.enum';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';
import { SubmitReviewerFeedbackDto } from './dto/submit-reviewer-feedback.dto';
import { ChairDecisionDto } from './dto/chair-decision.dto';
import { UserTenantRole } from '../user-tenant-roles/entities/user-tenant-role.entity';
import { RoleName } from '../common/enums';
import { ApplicationsService } from '../applications/services/applications.service';

const ASSIGNABLE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.SCREENING,
  ApplicationStatus.UNDER_REVIEW,
];

const CHAIR_DECISION_TO_STATUS: Record<ChairDecision, ApplicationStatus> = {
  [ChairDecision.APPROVED]: ApplicationStatus.APPROVED,
  [ChairDecision.CONDITIONALLY_APPROVED]:
    ApplicationStatus.CONDITIONALLY_APPROVED,
  [ChairDecision.REVISIONS_REQUIRED]: ApplicationStatus.REVISIONS_REQUIRED,
  [ChairDecision.REJECTED]: ApplicationStatus.REJECTED,
  // RFDR/RTIC: placeholder outcomes — keep application in review for now.
  [ChairDecision.RFDR]: ApplicationStatus.UNDER_REVIEW,
  [ChairDecision.RTIC]: ApplicationStatus.UNDER_REVIEW,
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(UserTenantRole)
    private readonly utrRepo: Repository<UserTenantRole>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async findForViewer(applicationId: string, userId: string): Promise<Review> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    const roles = await this.getActiveRoleNames(userId);
    const isOwner = application.applicantId === userId;
    const isStaff = roles.some((r) => r !== RoleName.APPLICANT);
    if (!isOwner && !isStaff) {
      throw new ForbiddenException('Not authorized to view this review');
    }

    return this.getOrCreateReview(applicationId);
  }

  async assignReviewer(
    applicationId: string,
    dto: AssignReviewerDto,
    userId: string,
  ): Promise<Review> {
    await this.requireAnyRole(userId, [
      RoleName.CHAIRPERSON,
      RoleName.RNEC_ADMIN,
      RoleName.IRB_ADMIN,
      RoleName.SYS_ADMIN,
    ]);

    const application = await this.applicationRepo.findOneOrFail({
      where: { id: applicationId },
    });
    if (!ASSIGNABLE_STATUSES.includes(application.status)) {
      throw new BadRequestException(
        `Cannot assign reviewer on application in status "${application.status}"`,
      );
    }

    const reviewerRoles = await this.getActiveRoleNames(dto.reviewerId);
    if (!reviewerRoles.includes(RoleName.REVIEWER)) {
      throw new BadRequestException('Selected user is not a REVIEWER');
    }

    const review = await this.getOrCreateReview(applicationId);
    if (review.stage !== ReviewStage.PENDING_ASSIGNMENT) {
      throw new BadRequestException(
        `Reviewer can only be assigned while stage is "${ReviewStage.PENDING_ASSIGNMENT}"`,
      );
    }

    review.reviewerId = dto.reviewerId;
    review.assignedById = userId;
    review.assignedAt = new Date();
    review.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    review.stage = ReviewStage.IN_REVIEWER;
    review.reviewerDecision = null;
    review.reviewerComments = null;
    review.reviewerSubmittedAt = null;
    review.lastUpdatedById = userId;
    const saved = await this.reviewRepo.save(review);

    if (application.status !== ApplicationStatus.UNDER_REVIEW) {
      await this.applicationsService.transitionStatus(
        application.id,
        ApplicationStatus.UNDER_REVIEW,
        userId,
      );
    }

    return this.loadWithRelations(saved.id);
  }

  async submitReviewerFeedback(
    applicationId: string,
    dto: SubmitReviewerFeedbackDto,
    userId: string,
  ): Promise<Review> {
    const review = await this.getOrCreateReview(applicationId);
    if (review.stage !== ReviewStage.IN_REVIEWER) {
      throw new BadRequestException(
        `Cannot submit feedback while stage is "${review.stage}"`,
      );
    }
    if (review.reviewerId !== userId) {
      throw new ForbiddenException(
        'Only the assigned reviewer can submit feedback',
      );
    }

    review.reviewerDecision = dto.decision;
    review.reviewerComments = dto.comments;
    review.reviewerSubmittedAt = new Date();
    review.stage = ReviewStage.AWAITING_CHAIR;
    review.lastUpdatedById = userId;
    await this.reviewRepo.save(review);

    return this.loadWithRelations(review.id);
  }

  async recordChairDecision(
    applicationId: string,
    dto: ChairDecisionDto,
    userId: string,
  ): Promise<Review> {
    await this.requireAnyRole(userId, [
      RoleName.CHAIRPERSON,
      RoleName.SYS_ADMIN,
    ]);

    const review = await this.getOrCreateReview(applicationId);
    if (review.stage !== ReviewStage.AWAITING_CHAIR) {
      throw new BadRequestException(
        `Chair decision requires stage AWAITING_CHAIR (current: "${review.stage}")`,
      );
    }

    review.chairDecision = dto.decision;
    review.chairComments = dto.comments;
    review.chairDecidedAt = new Date();
    review.chairDecidedById = userId;
    review.stage = ReviewStage.COMPLETED;
    review.lastUpdatedById = userId;
    await this.reviewRepo.save(review);

    await this.applicationsService.transitionStatus(
      applicationId,
      CHAIR_DECISION_TO_STATUS[dto.decision],
      userId,
      { setDecisionAt: true },
    );

    return this.loadWithRelations(review.id);
  }

  private async getOrCreateReview(applicationId: string): Promise<Review> {
    const existing = await this.reviewRepo.findOne({
      where: { applicationId },
    });
    if (existing) return existing;
    const created = this.reviewRepo.create({
      applicationId,
      stage: ReviewStage.PENDING_ASSIGNMENT,
    });
    return this.reviewRepo.save(created);
  }

  private async loadWithRelations(reviewId: string): Promise<Review> {
    return this.reviewRepo.findOneOrFail({
      where: { id: reviewId },
      relations: {
        reviewer: true,
        assignedBy: true,
        chairDecidedBy: true,
      },
    });
  }

  private async getActiveRoleNames(userId: string): Promise<RoleName[]> {
    const rows = await this.utrRepo.find({
      where: { userId, isActive: true },
      relations: { role: true },
    });
    return rows.map((r) => r.role.name);
  }

  private async requireAnyRole(
    userId: string,
    allowed: RoleName[],
  ): Promise<void> {
    const roles = await this.getActiveRoleNames(userId);
    if (!roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException(
        `Requires one of roles: ${allowed.join(', ')}`,
      );
    }
  }

  async listReviewers(userId: string): Promise<
    Array<{
      id: string;
      email: string;
      firstName: string;
      surname: string;
      professionalTitle: string | null;
      institutionalAffiliation: string | null;
    }>
  > {
    await this.requireAnyRole(userId, [
      RoleName.CHAIRPERSON,
      RoleName.RNEC_ADMIN,
      RoleName.IRB_ADMIN,
      RoleName.SYS_ADMIN,
    ]);

    const rows = await this.utrRepo.find({
      where: { isActive: true },
      relations: { role: true, user: true },
    });
    const reviewers = rows.filter(
      (r) => r.role.name === RoleName.REVIEWER && r.user?.isActive,
    );
    const seen = new Set<string>();
    const out: Array<{
      id: string;
      email: string;
      firstName: string;
      surname: string;
      professionalTitle: string | null;
      institutionalAffiliation: string | null;
    }> = [];
    for (const r of reviewers) {
      if (seen.has(r.user.id)) continue;
      seen.add(r.user.id);
      out.push({
        id: r.user.id,
        email: r.user.email,
        firstName: r.user.firstName,
        surname: r.user.surname,
        professionalTitle: r.user.professionalTitle,
        institutionalAffiliation: r.user.institutionalAffiliation,
      });
    }
    return out;
  }
}
