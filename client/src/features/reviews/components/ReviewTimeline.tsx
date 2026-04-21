import type { Review } from '@/features/reviews/api/types';
import { capitalizeString, formatDate } from '@/utils/strings.utils';

interface Props {
  review: Review;
}

export function ReviewTimeline({ review }: Props) {
  const items: { at: string | null; title: string; body?: string | null }[] = [];

  if (review.assignedAt) {
    const who = review.reviewer
      ? `${review.reviewer.firstName} ${review.reviewer.surname}`
      : 'Reviewer';
    items.push({
      at: review.assignedAt,
      title: `Assigned to ${who}`,
      body: review.dueAt
        ? `Due ${formatDate(review.dueAt, 'DD MMM YYYY')}`
        : null,
    });
  }
  if (review.reviewerSubmittedAt) {
    items.push({
      at: review.reviewerSubmittedAt,
      title: `Reviewer: ${capitalizeString(review.reviewerDecision ?? '')}`,
      body: review.reviewerComments,
    });
  }
  if (review.chairDecidedAt) {
    items.push({
      at: review.chairDecidedAt,
      title: `Chairperson: ${capitalizeString(review.chairDecision ?? '')}`,
      body: review.chairComments,
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-[11.5px] text-primary/45">
        No review activity yet.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-primary/12 pl-4">
      {items.map((it, i) => (
        <li key={i} className="mb-4 last:mb-0">
          <span className="absolute -left-[5px] mt-1 size-2.5 rounded-full border-2 border-white bg-primary/60" />
          <p className="text-[10.5px] tracking-wider text-primary/45 uppercase">
            {it.at ? formatDate(it.at, 'DD MMM YYYY · HH:mm') : ''}
          </p>
          <p className="mt-0.5 text-[12.5px] font-medium text-primary">
            {it.title}
          </p>
          {it.body && (
            <p className="mt-1 text-[12px] leading-relaxed whitespace-pre-wrap text-primary/65">
              {it.body}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
