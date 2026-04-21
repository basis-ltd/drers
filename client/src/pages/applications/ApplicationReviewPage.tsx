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
        <p className="text-[12px] text-primary/50">Loading review…</p>
      </main>
    );
  }

  if (!canReview) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          You don&rsquo;t have permission to review applications.
        </p>
      </main>
    );
  }

  const appErrorStatus = getErrorStatus(appError);
  if (appErrorStatus === 403) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          You don&rsquo;t have permission to view this application.
        </p>
      </main>
    );
  }

  if (appError || !application) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          {appErrorStatus === 404
            ? 'Application not found.'
            : 'Failed to load application.'}
        </p>
      </main>
    );
  }

  const reviewErrorStatus = getErrorStatus(reviewError);
  if (reviewErrorStatus === 403) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          You don&rsquo;t have permission to access this review.
        </p>
      </main>
    );
  }

  if (reviewError || !review) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          {reviewErrorStatus === 404
            ? 'Review workspace is not available for this application.'
            : 'Failed to load review workspace.'}
        </p>
      </main>
    );
  }

  if (!isReviewEligible(application.status)) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-primary/55">
          This application is in status{' '}
          <strong className="text-primary">{application.status}</strong> and is
          not open for review.
        </p>
      </main>
    );
  }

  const isAssignedReviewer = review.reviewerId === userId;
  const isChair = isChairperson || isAdmin;

  return (
    <main className="min-h-full px-4 py-8 md:px-8">
      <nav className="mb-4 flex items-center justify-between gap-3">
        <Link
          to={`/applications/${application.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] text-primary/55 hover:text-primary"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
          Back to details
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-w-0 flex-col gap-5">
          <ApplicationSummaryCard application={application} />
          <ApplicationSectionGrid application={application} />
          <section>
            <h2 className="mb-3 font-heading text-[18px] text-primary">
              Documents & extraction
            </h2>
            <DocumentList documents={documents} />
          </section>
        </section>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-md border-l-2 border-primary/15 bg-white px-5 py-5">
            <p className="mb-4 text-[10px] font-medium tracking-[0.18em] text-primary/45 uppercase">
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
                <p className="mb-3 text-[10px] font-medium tracking-[0.18em] text-primary/45 uppercase">
                  Activity
                </p>
                <ReviewTimeline review={review} />
              </div>
            )}
          </div>
        </aside>
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
    <div className="rounded-sm border border-dashed border-primary/15 px-3 py-4 text-[12px]">
      <p className="font-medium text-primary">{title}</p>
      <p className="mt-0.5 text-primary/55">{body}</p>
    </div>
  );
}
