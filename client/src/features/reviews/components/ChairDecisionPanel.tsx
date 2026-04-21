import { useState } from 'react';
import { useChairDecisionMutation } from '@/features/reviews/api/reviewsApi';
import type { ChairDecisionValue, Review } from '@/features/reviews/api/types';
import { capitalizeString, formatDate } from '@/utils/strings.utils';

const OPTIONS: {
  value: ChairDecisionValue;
  label: string;
  hint?: string;
  tone: string;
}[] = [
  {
    value: 'APPROVED',
    label: 'Approve',
    tone: 'border-emerald-200 data-[on=true]:bg-emerald-50 data-[on=true]:text-emerald-800',
  },
  {
    value: 'CONDITIONALLY_APPROVED',
    label: 'Conditionally approve',
    tone: 'border-teal-200 data-[on=true]:bg-teal-50 data-[on=true]:text-teal-800',
  },
  {
    value: 'REVISIONS_REQUIRED',
    label: 'Request revisions',
    tone: 'border-amber-200 data-[on=true]:bg-amber-50 data-[on=true]:text-amber-800',
  },
  {
    value: 'REJECTED',
    label: 'Reject',
    tone: 'border-red-200 data-[on=true]:bg-red-50 data-[on=true]:text-red-800',
  },
  {
    value: 'RFDR',
    label: 'RFDR',
    hint: 'Placeholder outcome',
    tone: 'border-primary/15 data-[on=true]:bg-primary/6 data-[on=true]:text-primary',
  },
  {
    value: 'RTIC',
    label: 'RTIC',
    hint: 'Placeholder outcome',
    tone: 'border-primary/15 data-[on=true]:bg-primary/6 data-[on=true]:text-primary',
  },
];

interface Props {
  applicationId: string;
  review: Review;
}

export function ChairDecisionPanel({ applicationId, review }: Props) {
  const [decision, setDecision] = useState<ChairDecisionValue | null>(null);
  const [comments, setComments] = useState('');
  const [submit, { isLoading, error }] = useChairDecisionMutation();

  const canSubmit = decision && comments.trim().length >= 10;

  const onSubmit = async () => {
    if (!decision) return;
    await submit({
      applicationId,
      body: { decision, comments },
    }).unwrap();
  };

  return (
    <div className="flex flex-col gap-4">
      <ReviewerFeedbackReadout review={review} />

      <fieldset>
        <legend className="mb-1.5 text-[10px] font-medium tracking-wider text-primary/55 uppercase">
          Final decision
        </legend>
        <div className="grid grid-cols-2 gap-1.5">
          {OPTIONS.map((o) => {
            const on = decision === o.value;
            return (
              <button
                key={o.value}
                type="button"
                data-on={on}
                onClick={() => setDecision(o.value)}
                className={`rounded-sm border px-2.5 py-2 text-left text-[11.5px] transition-colors ${o.tone} ${
                  on ? '' : 'border-primary/12 text-primary/70 hover:bg-primary/3'
                }`}
              >
                <span className="block">{o.label}</span>
                {o.hint && (
                  <span className="block text-[9.5px] text-primary/40">
                    {o.hint}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="mb-1 block text-[10px] font-medium tracking-wider text-primary/55 uppercase">
          Chairperson comments
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={6}
          placeholder="Record the rationale. Visible to the applicant."
          className="w-full rounded-sm border border-primary/15 px-2.5 py-2 text-[12px] text-primary outline-none focus:border-primary/40"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-600">
          {(error as { data?: { message?: string } }).data?.message ??
            'Failed to record decision'}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit || isLoading}
        onClick={onSubmit}
        className="rounded-sm bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground disabled:opacity-40"
      >
        {isLoading ? 'Recording…' : 'Record decision'}
      </button>
    </div>
  );
}

export function ReviewerFeedbackReadout({ review }: { review: Review }) {
  if (!review.reviewerSubmittedAt) return null;
  const reviewer = review.reviewer;
  return (
    <section className="rounded-sm border border-primary/10 bg-primary/3 p-3">
      <p className="text-[10px] font-medium tracking-wider text-primary/55 uppercase">
        Reviewer recommendation
      </p>
      <p className="mt-1 text-[12.5px] text-primary">
        {capitalizeString(review.reviewerDecision ?? '')}
      </p>
      <p className="mt-0.5 text-[10.5px] text-primary/45">
        {reviewer
          ? `${reviewer.firstName} ${reviewer.surname}`
          : 'Reviewer'}
        {review.reviewerSubmittedAt
          ? ` · ${formatDate(review.reviewerSubmittedAt, 'DD MMM YYYY')}`
          : ''}
      </p>
      {review.reviewerComments && (
        <p className="mt-2 text-[12px] leading-relaxed whitespace-pre-wrap text-primary/75">
          {review.reviewerComments}
        </p>
      )}
    </section>
  );
}
