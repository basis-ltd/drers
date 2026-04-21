import { Badge } from '@/components/ui/badge';
import type { Application } from '@/features/applications/api/types';
import { statusStyle } from '@/features/applications/utils/statusStyles';
import { capitalizeString, formatDate } from '@/utils/strings.utils';

interface Props {
  application: Application;
  applicantName?: string;
}

export function ApplicationSummaryCard({ application, applicantName }: Props) {
  const status = statusStyle(application.status);
  return (
    <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow-label text-primary/60">
            {application.referenceNumber}
          </p>
          <h1 className="mt-2 font-heading text-[24px] leading-tight text-primary md:text-[28px]">
            {application.details?.title ?? 'Untitled study'}
          </h1>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-primary/70">
            {applicantName && (
              <div className="flex gap-1.5">
                <dt className="text-primary/55">Applicant</dt>
                <dd>{applicantName}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="text-primary/55">Type</dt>
              <dd>{capitalizeString(application.type)}</dd>
            </div>
            {application.details?.pathway && (
              <div className="flex gap-1.5">
                <dt className="text-primary/55">Pathway</dt>
                <dd>{capitalizeString(application.details.pathway)}</dd>
              </div>
            )}
            {application.submittedAt && (
              <div className="flex gap-1.5">
                <dt className="text-primary/55">Submitted</dt>
                <dd>{formatDate(application.submittedAt, 'DD MMM YYYY')}</dd>
              </div>
            )}
            {application.decisionAt && (
              <div className="flex gap-1.5">
                <dt className="text-primary/55">Decision</dt>
                <dd>{formatDate(application.decisionAt, 'DD MMM YYYY')}</dd>
              </div>
            )}
          </dl>
        </div>
        <Badge
          variant="outline"
          className={`h-6 text-[11px] font-medium ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>
    </section>
  );
}
