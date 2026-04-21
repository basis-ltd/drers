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
    <section className="rounded-md border border-primary/10 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.14em] text-primary/40 uppercase">
            {application.referenceNumber}
          </p>
          <h1 className="mt-1 font-heading text-2xl leading-tight text-primary md:text-[28px]">
            {application.details?.title ?? 'Untitled study'}
          </h1>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-primary/55">
            {applicantName && (
              <div className="flex gap-1.5">
                <dt className="text-primary/40">Applicant</dt>
                <dd>{applicantName}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="text-primary/40">Type</dt>
              <dd>{capitalizeString(application.type)}</dd>
            </div>
            {application.details?.pathway && (
              <div className="flex gap-1.5">
                <dt className="text-primary/40">Pathway</dt>
                <dd>{capitalizeString(application.details.pathway)}</dd>
              </div>
            )}
            {application.submittedAt && (
              <div className="flex gap-1.5">
                <dt className="text-primary/40">Submitted</dt>
                <dd>{formatDate(application.submittedAt, 'DD MMM YYYY')}</dd>
              </div>
            )}
            {application.decisionAt && (
              <div className="flex gap-1.5">
                <dt className="text-primary/40">Decision</dt>
                <dd>{formatDate(application.decisionAt, 'DD MMM YYYY')}</dd>
              </div>
            )}
          </dl>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] font-medium ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>
    </section>
  );
}
