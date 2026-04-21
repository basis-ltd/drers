import type { ApplicationStatus } from '@/features/applications/api/types';

export interface StatusStyle {
  label: string;
  className: string;
}

export const STATUS_STYLES: Record<ApplicationStatus, StatusStyle> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-primary/20 bg-primary/6 text-primary/80',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  SCREENING: {
    label: 'Screening',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  },
  QUERY_RAISED: {
    label: 'Query Raised',
    className: 'border-orange-200 bg-orange-50 text-orange-800',
  },
  RESUBMITTED: {
    label: 'Resubmitted',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  },
  MEETING_SCHEDULED: {
    label: 'Meeting Scheduled',
    className: 'border-violet-200 bg-violet-50 text-violet-800',
  },
  APPROVED: {
    label: 'Approved',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  CONDITIONALLY_APPROVED: {
    label: 'Conditionally Approved',
    className: 'border-teal-200 bg-teal-50 text-teal-800',
  },
  REVISIONS_REQUIRED: {
    label: 'Revisions Required',
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  CLOSED: {
    label: 'Closed',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
};

export function statusStyle(status: ApplicationStatus): StatusStyle {
  return STATUS_STYLES[status] ?? { label: status, className: '' };
}

const REVIEW_ELIGIBLE: ApplicationStatus[] = [
  'SUBMITTED',
  'SCREENING',
  'UNDER_REVIEW',
  'MEETING_SCHEDULED',
];

export function isReviewEligible(status: ApplicationStatus): boolean {
  return REVIEW_ELIGIBLE.includes(status);
}
