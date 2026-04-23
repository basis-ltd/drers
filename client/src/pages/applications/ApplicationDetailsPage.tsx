import { Link, useParams } from "react-router-dom";
import {
  useGetApplicationQuery,
  useListDocumentsQuery,
} from "@/features/applications/api/applicationsApi";
import { ApplicationSummaryCard } from "@/features/applications/components/ApplicationSummaryCard";
import { ApplicationSectionGrid } from "@/features/applications/components/ApplicationSectionGrid";
import { DocumentList } from "@/features/documents/components/DocumentList";
import { useRoles } from "@/features/auth/hooks/useRoles";
import { isReviewEligible } from "@/features/applications/utils/statusStyles";
import { SkeletonLoader } from "@/components/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faGavel } from "@fortawesome/free-solid-svg-icons";

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("status" in error)) return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

export function ApplicationDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const {
    data: application,
    isLoading,
    error,
  } = useGetApplicationQuery(id, {
    skip: !id,
  });
  const {
    data: documents = [],
    isLoading: documentsLoading,
    isFetching: documentsFetching,
  } = useListDocumentsQuery(id, { skip: !id });
  const { isReviewer, isChairperson, isAdmin } = useRoles();
  const canReview = isReviewer || isChairperson || isAdmin;

  if (isLoading) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-[14px] text-primary/70" role="status">
            Loading application...
          </p>
        </div>
      </main>
    );
  }
  const status = getErrorStatus(error);
  if (status === 403) {
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
  if (error || !application) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[1280px] rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-[14px] text-red-800" role="alert">
            {status === 404
              ? "Application not found."
              : "Failed to load application."}
          </p>
        </div>
      </main>
    );
  }

  const showReviewAction = canReview && isReviewEligible(application.status);
  const showDocumentsSkeleton = documentsLoading || documentsFetching;

  return (
    <main className="min-h-full px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <nav className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/applications"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-primary/65 hover:bg-primary/5 hover:text-primary"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
            Back to applications
          </Link>
          {showReviewAction && (
            <Link
              to={`/applications/${application.id}/review`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[12px] font-medium text-primary-foreground"
            >
              <FontAwesomeIcon icon={faGavel} className="size-3" />
              Open review
            </Link>
          )}
        </nav>

        <header className="mb-5 rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <p className="eyebrow-label">Application details</p>
          <h2 className="heading-section mt-1">Review application record</h2>
          <p className="mt-1 text-[13px] text-primary/65">
            View study metadata, submitted content, and supporting documents.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          <ApplicationSummaryCard application={application} />

          <section>
            <h2 className="heading-section mb-3">Documents & OCR screening</h2>
            {showDocumentsSkeleton ? (
              <div
                className="space-y-3"
                role="status"
                aria-label="Loading documents"
              >
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
              </div>
            ) : (
              <DocumentList
                documents={documents}
                compact
                applicationId={application.id}
                canTriggerManualOcr={canReview}
                showExtractedText={false}
              />
            )}
          </section>

          <ApplicationSectionGrid application={application} staggered />
        </div>
      </div>
    </main>
  );
}
