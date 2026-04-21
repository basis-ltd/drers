import { Link, useParams } from 'react-router-dom';
import {
  useGetApplicationQuery,
  useListDocumentsQuery,
} from '@/features/applications/api/applicationsApi';
import { ApplicationSummaryCard } from '@/features/applications/components/ApplicationSummaryCard';
import { ApplicationSectionGrid } from '@/features/applications/components/ApplicationSectionGrid';
import { DocumentList } from '@/features/documents/components/DocumentList';
import { useRoles } from '@/features/auth/hooks/useRoles';
import { isReviewEligible } from '@/features/applications/utils/statusStyles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faGavel } from '@fortawesome/free-solid-svg-icons';

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object' || !('status' in error)) return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

export function ApplicationDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: application, isLoading, error } = useGetApplicationQuery(id, {
    skip: !id,
  });
  const { data: documents = [] } = useListDocumentsQuery(id, { skip: !id });
  const { isReviewer, isChairperson, isAdmin } = useRoles();
  const canReview = isReviewer || isChairperson || isAdmin;

  if (isLoading) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-primary/50">Loading application…</p>
      </main>
    );
  }
  const status = getErrorStatus(error);
  if (status === 403) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          You don&rsquo;t have permission to view this application.
        </p>
      </main>
    );
  }
  if (error || !application) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-[12px] text-red-600">
          {status === 404
            ? 'Application not found.'
            : 'Failed to load application.'}
        </p>
      </main>
    );
  }

  const showReviewAction =
    canReview && isReviewEligible(application.status);

  return (
    <main className="min-h-full px-4 py-8 md:px-8">
      <nav className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-[11px] text-primary/55 hover:text-primary"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
          Back to applications
        </Link>
        {showReviewAction && (
          <Link
            to={`/applications/${application.id}/review`}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground"
          >
            <FontAwesomeIcon icon={faGavel} className="size-3" />
            Open review
          </Link>
        )}
      </nav>

      <div className="flex flex-col gap-5">
        <ApplicationSummaryCard application={application} />

        <ApplicationSectionGrid application={application} staggered />

        <section>
          <h2 className="mb-3 font-heading text-[18px] text-primary">
            Documents & extraction
          </h2>
          <DocumentList documents={documents} compact />
        </section>
      </div>
    </main>
  );
}
