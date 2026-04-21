import type { ApplicationStatus } from '@/features/applications/api/types';

export interface StatusStyle {
  label: string;
  className: string;
}

export const STATUS_STYLES: Record<ApplicationStatus, StatusStyle> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-primary/20 bg-primary/6 text-primary/70',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  SCREENING: {
    label: 'Screening',
    className: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  QUERY_RAISED: {
    label: 'Query Raised',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  RESUBMITTED: {
    label: 'Resubmitted',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  MEETING_SCHEDULED: {
    label: 'Meeting Scheduled',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  APPROVED: {
    label: 'Approved',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  CONDITIONALLY_APPROVED: {
    label: 'Conditional',
    className: 'border-teal-200 bg-teal-50 text-teal-700',
  },
  REVISIONS_REQUIRED: {
    label: 'Revisions Required',
    className: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className: 'border-slate-200 bg-slate-50 text-slate-500',
  },
  CLOSED: {
    label: 'Closed',
    className: 'border-slate-200 bg-slate-50 text-slate-500',
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
