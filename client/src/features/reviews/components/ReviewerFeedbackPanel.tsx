import { useState } from 'react';
import { useSubmitReviewerFeedbackMutation } from '@/features/reviews/api/reviewsApi';
import type { ReviewerDecision } from '@/features/reviews/api/types';

const OPTIONS: { value: ReviewerDecision; label: string; tone: string }[] = [
  {
    value: 'RECOMMEND_APPROVAL',
    label: 'Recommend approval',
    tone: 'border-emerald-200 data-[on=true]:bg-emerald-50 data-[on=true]:text-emerald-800',
  },
  {
    value: 'RECOMMEND_REVISIONS',
    label: 'Recommend revisions',
    tone: 'border-amber-200 data-[on=true]:bg-amber-50 data-[on=true]:text-amber-800',
  },
  {
    value: 'RECOMMEND_REJECTION',
    label: 'Recommend rejection',
    tone: 'border-red-200 data-[on=true]:bg-red-50 data-[on=true]:text-red-800',
  },
];

interface Props {
  applicationId: string;
}

export function ReviewerFeedbackPanel({ applicationId }: Props) {
  const [decision, setDecision] = useState<ReviewerDecision | null>(null);
  const [comments, setComments] = useState('');
  const [submit, { isLoading, error }] = useSubmitReviewerFeedbackMutation();

  const canSubmit = decision && comments.trim().length >= 10;

  const onSubmit = async () => {
    if (!decision) return;
    await submit({
      applicationId,
      body: { decision, comments },
    }).unwrap();
  };

  return (
    <div className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-1.5 text-[10px] font-medium tracking-wider text-primary/55 uppercase">
          Recommendation
        </legend>
        <div className="flex flex-col gap-1.5">
          {OPTIONS.map((o) => {
            const on = decision === o.value;
            return (
              <button
                key={o.value}
                type="button"
                data-on={on}
                onClick={() => setDecision(o.value)}
                className={`rounded-sm border px-3 py-2 text-left text-[12px] transition-colors ${o.tone} ${
                  on ? '' : 'border-primary/12 text-primary/70 hover:bg-primary/3'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="mb-1 block text-[10px] font-medium tracking-wider text-primary/55 uppercase">
          Comments
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={6}
          placeholder="Explain your recommendation. Cite specific sections and documents where relevant."
          className="w-full rounded-sm border border-primary/15 px-2.5 py-2 text-[12px] text-primary outline-none focus:border-primary/40"
        />
        <p className="mt-1 text-[10.5px] text-primary/40">
          Minimum 10 characters.
        </p>
      </div>

      {error && (
        <p className="text-[11px] text-red-600">
          {(error as { data?: { message?: string } }).data?.message ??
            'Failed to submit feedback'}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit || isLoading}
        onClick={onSubmit}
        className="rounded-sm bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground disabled:opacity-40"
      >
        {isLoading ? 'Submitting…' : 'Submit feedback'}
      </button>
    </div>
  );
}
