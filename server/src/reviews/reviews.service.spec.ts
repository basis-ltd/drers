import { ForbiddenException } from '@nestjs/common';
import { ApplicationStatus } from '../applications/enums/application-status.enum';
import { ApplicationsService } from '../applications/services/applications.service';
import { RoleName } from '../common/enums';
import { ChairDecision } from './enums/chair-decision.enum';
import { ReviewStage } from './enums/review-stage.enum';
import { ReviewerDecision } from './enums/reviewer-decision.enum';
import { ReviewsService } from './reviews.service';

type MockRepo = {
  findOne: jest.Mock;
  findOneOrFail: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

function makeRepo(): MockRepo {
  return {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
}

describe('ReviewsService', () => {
  let reviewRepo: MockRepo;
  let applicationRepo: MockRepo;
  let utrRepo: MockRepo;
  let applicationsService: { transitionStatus: jest.Mock };
  let service: ReviewsService;

  beforeEach(() => {
    reviewRepo = makeRepo();
    applicationRepo = makeRepo();
    utrRepo = makeRepo();
    applicationsService = { transitionStatus: jest.fn() };

    service = new ReviewsService(
      reviewRepo as never,
      applicationRepo as never,
      utrRepo as never,
      applicationsService as unknown as ApplicationsService,
    );
  });

  it('assigns reviewer and transitions application to UNDER_REVIEW', async () => {
    const applicationId = 'app-1';
    const actingUserId = 'chair-1';
    const reviewerId = 'reviewer-1';

    applicationRepo.findOneOrFail.mockResolvedValue({
      id: applicationId,
      applicantId: 'owner-1',
      status: ApplicationStatus.SUBMITTED,
    });
    utrRepo.find
      .mockResolvedValueOnce([{ role: { name: RoleName.CHAIRPERSON } }])
      .mockResolvedValueOnce([{ role: { name: RoleName.REVIEWER } }]);
    reviewRepo.findOne.mockResolvedValue(null);
    reviewRepo.create.mockReturnValue({
      id: 'review-1',
      applicationId,
      stage: ReviewStage.PENDING_ASSIGNMENT,
    });
    reviewRepo.save
      .mockResolvedValueOnce({
        id: 'review-1',
        applicationId,
        stage: ReviewStage.PENDING_ASSIGNMENT,
      })
      .mockResolvedValueOnce({
        id: 'review-1',
        applicationId,
        stage: ReviewStage.IN_REVIEWER,
        reviewerId,
        assignedById: actingUserId,
      });
    reviewRepo.findOneOrFail.mockResolvedValue({
      id: 'review-1',
      applicationId,
      stage: ReviewStage.IN_REVIEWER,
      reviewerId,
      reviewer: { id: reviewerId },
    });

    const result = await service.assignReviewer(
      applicationId,
      { reviewerId },
      actingUserId,
    );

    expect(result.stage).toBe(ReviewStage.IN_REVIEWER);
    expect(applicationsService.transitionStatus).toHaveBeenCalledWith(
      applicationId,
      ApplicationStatus.UNDER_REVIEW,
      actingUserId,
    );
  });

  it('blocks reviewer feedback from non-assigned user', async () => {
    reviewRepo.findOne.mockResolvedValue({
      id: 'review-1',
      applicationId: 'app-1',
      stage: ReviewStage.IN_REVIEWER,
      reviewerId: 'reviewer-1',
    });

    await expect(
      service.submitReviewerFeedback(
        'app-1',
        {
          decision: ReviewerDecision.RECOMMEND_APPROVAL,
          comments: 'Looks good.',
        },
        'another-user',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('records chair decision and delegates final status transition', async () => {
    const applicationId = 'app-2';
    const chairId = 'chair-2';

    utrRepo.find.mockResolvedValueOnce([
      { role: { name: RoleName.CHAIRPERSON } },
    ]);
    reviewRepo.findOne.mockResolvedValue({
      id: 'review-2',
      applicationId,
      stage: ReviewStage.AWAITING_CHAIR,
      reviewerId: 'reviewer-2',
    });
    reviewRepo.save.mockResolvedValue({
      id: 'review-2',
      applicationId,
      stage: ReviewStage.COMPLETED,
    });
    reviewRepo.findOneOrFail.mockResolvedValue({
      id: 'review-2',
      applicationId,
      stage: ReviewStage.COMPLETED,
      chairDecision: ChairDecision.APPROVED,
    });

    const result = await service.recordChairDecision(
      applicationId,
      { decision: ChairDecision.APPROVED, comments: 'Approved by chair.' },
      chairId,
    );

    expect(result.stage).toBe(ReviewStage.COMPLETED);
    expect(applicationsService.transitionStatus).toHaveBeenCalledWith(
      applicationId,
      ApplicationStatus.APPROVED,
      chairId,
      { setDecisionAt: true },
    );
  });

  it('restricts reviewer listing to chair/admin roles', async () => {
    utrRepo.find.mockResolvedValueOnce([{ role: { name: RoleName.FINANCE } }]);

    await expect(service.listReviewers('finance-user')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
