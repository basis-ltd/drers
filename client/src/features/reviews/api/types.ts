export type ReviewStage =
  | 'PENDING_ASSIGNMENT'
  | 'IN_REVIEWER'
  | 'AWAITING_CHAIR'
  | 'COMPLETED';

export type ReviewerDecision =
  | 'RECOMMEND_APPROVAL'
  | 'RECOMMEND_REVISIONS'
  | 'RECOMMEND_REJECTION';

export type ChairDecisionValue =
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REVISIONS_REQUIRED'
  | 'REJECTED'
  | 'RFDR'
  | 'RTIC';

export interface ReviewUserSummary {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  professionalTitle?: string | null;
  institutionalAffiliation?: string | null;
}

export interface Review {
  id: string;
  applicationId: string;
  stage: ReviewStage;
  reviewerId: string | null;
  assignedById: string | null;
  assignedAt: string | null;
  dueAt: string | null;
  reviewerDecision: ReviewerDecision | null;
  reviewerComments: string | null;
  reviewerSubmittedAt: string | null;
  chairDecision: ChairDecisionValue | null;
  chairComments: string | null;
  chairDecidedAt: string | null;
  chairDecidedById: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer?: ReviewUserSummary | null;
  assignedBy?: ReviewUserSummary | null;
  chairDecidedBy?: ReviewUserSummary | null;
}

export interface AssignReviewerBody {
  reviewerId: string;
  dueAt?: string;
}

export interface SubmitReviewerFeedbackBody {
  decision: ReviewerDecision;
  comments: string;
}

export interface ChairDecisionBody {
  decision: ChairDecisionValue;
  comments: string;
}
