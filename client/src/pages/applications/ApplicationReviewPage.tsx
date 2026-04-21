import { Link, useParams } from 'react-router-dom';
import {
  useGetApplicationQuery,
  useListDocumentsQuery,
} from '@/features/applications/api/applicationsApi';
import { useGetReviewQuery } from '@/features/reviews/api/reviewsApi';
import { ApplicationSummaryCard } from '@/features/applications/components/ApplicationSummaryCard';
import { ApplicationSectionGrid } from '@/features/applications/components/ApplicationSectionGrid';
import { DocumentList } from '@/features/documents/components/DocumentList';
import { ReviewStageStepper } from '@/features/reviews/components/ReviewStageStepper';
import { AssignReviewerPanel } from '@/features/reviews/components/AssignReviewerPanel';
import { ReviewerFeedbackPanel } from '@/features/reviews/components/ReviewerFeedbackPanel';
import {
  ChairDecisionPanel,
  ReviewerFeedbackReadout,
} from '@/features/reviews/components/ChairDecisionPanel';
import { ReviewTimeline } from '@/features/reviews/components/ReviewTimeline';
import { useRoles } from '@/features/auth/hooks/useRoles';
import { isReviewEligible } from '@/features/applications/utils/statusStyles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object' || !('status' in error)) return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

export function ApplicationReviewPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { userId, isReviewer, isChairperson, isAdmin, isLoading: rolesLoading } =
    useRoles();
  const {
    data: application,
    isLoading: appLoading,
    error: appError,
  } = useGetApplicationQuery(id, { skip: !id });
  const { data: documents = [] } = useListDocumentsQuery(id, { skip: !id });
  const {
    data: review,
    isLoading: reviewLoading,
    error: reviewError,
  } = useGetReviewQuery(id, { skip: !id });

  const canReview = isReviewer || isChairperson || isAdmin;

  if (appLoading || reviewLoading || rolesLoading) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-[14px] text-primary/70" role="status">
            Loading review workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!canReview) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-[14px] text-red-800" role="alert">
            You do not have permission to review applications.
          </p>
        </div>
      </main>
    );
  }

  const appErrorStatus = getErrorStatus(appError);
  if (appErrorStatus === 403) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-[14px] text-red-800" role="alert">
            You do not have permission to view this application.
          </p>
        </div>
      </main>
    );
  }

  if (appError || !application) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-[14px] text-red-800" role="alert">
            {appErrorStatus === 404
              ? 'Application not found.'
              : 'Failed to load application.'}
          </p>
        </div>
      </main>
    );
  }

  const reviewErrorStatus = getErrorStatus(reviewError);
  if (reviewErrorStatus === 403) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-[14px] text-red-800" role="alert">
            You do not have permission to access this review.
          </p>
        </div>
      </main>
    );
  }

  if (reviewError || !review) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-[14px] text-red-800" role="alert">
            {reviewErrorStatus === 404
              ? 'Review workspace is not available for this application.'
              : 'Failed to load review workspace.'}
          </p>
        </div>
      </main>
    );
  }

  if (!isReviewEligible(application.status)) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-primary/12 bg-white p-6 shadow-sm">
          <p className="text-[14px] text-primary/70">
            This application is in status{' '}
            <strong className="text-primary">{application.status}</strong> and is
            not open for review.
          </p>
        </div>
      </main>
    );
  }

  const isAssignedReviewer = review.reviewerId === userId;
  const isChair = isChairperson || isAdmin;

  return (
    <main className="min-h-full px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
      <nav className="mb-4 flex items-center justify-between gap-3">
        <Link
          to={`/applications/${application.id}`}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-primary/65 hover:bg-primary/5 hover:text-primary"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
          Back to details
        </Link>
      </nav>

      <header className="mb-5 rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <p className="eyebrow-label">Review workspace</p>
        <h1 className="heading-page mt-1">Application review</h1>
        <p className="mt-1 text-[13px] text-primary/65">
          Evaluate application evidence, capture reviewer feedback, and record decisions.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-w-0 flex-col gap-5">
          <ApplicationSummaryCard application={application} />
          <ApplicationSectionGrid application={application} />
          <section>
            <h2 className="heading-section mb-3">
              Documents & extraction
            </h2>
            <DocumentList documents={documents} />
          </section>
        </section>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-lg border border-primary/10 bg-white px-5 py-5 shadow-sm">
            <p className="mb-4 text-[11px] font-medium tracking-[0.16em] text-primary/55 uppercase">
              Review workbench
            </p>
            <ReviewStageStepper stage={review.stage} />
            <div className="mt-6">
              <ActionPanel
                applicationId={application.id}
                review={review}
                isAssignedReviewer={isAssignedReviewer}
                isChair={isChair}
              />
            </div>
            {review.stage !== 'PENDING_ASSIGNMENT' && (
              <div className="mt-6 border-t border-primary/8 pt-5">
                <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-primary/55 uppercase">
                  Activity
                </p>
                <ReviewTimeline review={review} />
              </div>
            )}
          </div>
        </aside>
      </div>
      </div>
    </main>
  );
}

function ActionPanel({
  applicationId,
  review,
  isAssignedReviewer,
  isChair,
}: {
  applicationId: string;
  review: import('@/features/reviews/api/types').Review;
  isAssignedReviewer: boolean;
  isChair: boolean;
}) {
  if (review.stage === 'COMPLETED') {
    return (
      <EmptyState
        title="Review complete"
        body="No further actions required."
      />
    );
  }
  if (review.stage === 'PENDING_ASSIGNMENT') {
    if (!isChair) {
      return (
        <EmptyState
          title="Awaiting reviewer assignment"
          body="A chairperson or administrator must assign a reviewer before review can begin."
        />
      );
    }
    return <AssignReviewerPanel applicationId={applicationId} />;
  }
  if (review.stage === 'IN_REVIEWER') {
    if (!isAssignedReviewer) {
      return (
        <EmptyState
          title="Awaiting reviewer feedback"
          body={`Assigned to ${review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.surname}` : 'the reviewer'}.`}
        />
      );
    }
    return <ReviewerFeedbackPanel applicationId={applicationId} />;
  }
  if (review.stage === 'AWAITING_CHAIR') {
    if (!isChair) {
      return (
        <div className="flex flex-col gap-4">
          <EmptyState
            title="Awaiting chairperson decision"
            body="The reviewer has submitted feedback. The chairperson will record the final decision."
          />
          <ReviewerFeedbackReadout review={review} />
        </div>
      );
    }
    return <ChairDecisionPanel applicationId={applicationId} review={review} />;
  }
  return null;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-primary/20 bg-primary/[0.015] px-3.5 py-4 text-[13px]">
      <p className="font-medium text-primary/90">{title}</p>
      <p className="mt-1 text-primary/65">{body}</p>
    </div>
  );
}
