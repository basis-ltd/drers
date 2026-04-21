import type { ReviewStage } from '@/features/reviews/api/types';

const ORDER: { key: ReviewStage; label: string }[] = [
  { key: 'PENDING_ASSIGNMENT', label: 'Assign' },
  { key: 'IN_REVIEWER', label: 'Reviewer' },
  { key: 'AWAITING_CHAIR', label: 'Chairperson' },
  { key: 'COMPLETED', label: 'Complete' },
];

interface Props {
  stage: ReviewStage;
}

export function ReviewStageStepper({ stage }: Props) {
  const activeIndex = ORDER.findIndex((s) => s.key === stage);
  return (
    <ol
      className="flex items-center gap-2"
      aria-label="Review progress"
    >
      {ORDER.map((step, i) => {
        const isDone = i < activeIndex || stage === 'COMPLETED';
        const isActive = i === activeIndex && stage !== 'COMPLETED';
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-amber-500 text-white'
                      : 'border border-primary/15 bg-white text-primary/40'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <span
                className={`mt-1 text-[9.5px] font-medium tracking-wider uppercase ${
                  isDone || isActive ? 'text-primary/70' : 'text-primary/35'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < ORDER.length - 1 && (
              <div
                className={`-mt-4 h-px flex-1 ${
                  isDone ? 'bg-primary/40' : 'bg-primary/12'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
