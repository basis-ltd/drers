import { ArrowRight, Check } from "lucide-react";
import { STEPS } from "../../constants/formSteps";
import { Link } from "react-router-dom";

interface WizardStepperProps {
  current: number;
  completed: Set<number>;
  onGoto: (step: number) => void;
}

export function WizardStepper({
  current,
  completed,
  onGoto,
}: WizardStepperProps) {
  return (
    <nav
      aria-label="Form steps"
      className="overflow-x-auto px-4 py-4 sm:px-6 md:px-8"
    >
      <ol className="flex min-w-max items-stretch gap-3 pb-1 md:min-w-0">
        {STEPS.map((step, idx) => {
          const num = step.id;
          const isActive = current === num;
          const isPast = num < current;
          const isDone = completed.has(num);
          const isCompleted = isPast || isDone;
          const isLast = idx === STEPS.length - 1;
          const canNavigate = isPast || isDone;

          return (
            <li
              key={num}
              className="relative min-w-[148px] flex-1 sm:min-w-[160px]"
            >
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[calc(50%+1.8rem)] right-[-0.75rem] top-6 h-px rounded-full transition-colors duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-r from-primary/50 to-primary/20"
                      : "bg-slate-200"
                  }`}
                />
              )}

              <Link
                to={canNavigate ? `/applications/new/${num}` : "#"}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${num}: ${step.short}${
                  isDone ? " (completed)" : isActive ? " (current)" : ""
                }`}
                className={`
                  group relative flex h-full min-h-[108px] flex-col rounded-xl border px-3 py-3.5 text-left
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? "border-primary/12 bg-primary/[0.06] shadow-[0_4px_20px_-4px_rgba(0,90,150,0.14)]"
                      : canNavigate
                        ? "border-slate-200 bg-white hover:border-primary/15 hover:bg-slate-50/80 hover:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)]"
                        : "border-slate-100 bg-gradient-to-b from-slate-50 to-white"
                  }
                  ${canNavigate ? "cursor-pointer" : "cursor-default"}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
                `}
                onClick={(e) => {
                  if (canNavigate) {
                    e.preventDefault();
                    onGoto(num);
                  } else {
                    e.preventDefault();
                  }
                }}
              >
                <span className="mb-3 flex items-center gap-3">
                  <span
                    className={`
                      relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold
                      transition-all duration-300 ease-out
                      ${
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-[0_3px_10px_-3px_rgba(0,90,150,0.4)] ring-4 ring-primary/10"
                            : isPast
                              ? "bg-primary/10 text-primary/70"
                              : "bg-slate-100 text-slate-400"
                      }
                    `}
                    aria-hidden
                  >
                    {isDone && !isActive ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      num
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`
                        block text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200
                        ${
                          isActive
                            ? "text-primary/65"
                            : isCompleted
                              ? "text-primary/45"
                              : "text-slate-400"
                        }
                      `}
                    >
                      Step {num}
                    </span>
                  </span>

                  {isActive && (
                    <ArrowRight
                      className="size-3.5 shrink-0 text-primary/55"
                      aria-hidden
                    />
                  )}
                </span>

                <span
                  className={`
                    block whitespace-pre-line text-sm font-medium leading-snug transition-colors duration-200
                    ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                          ? "text-primary/80"
                          : "text-slate-400"
                    }
                  `}
                >
                  {step.label}
                </span>

                <span
                  className={`
                    mt-auto pt-3 text-[11px] leading-relaxed transition-colors duration-200
                    ${
                      isActive
                        ? "text-primary/60"
                        : isCompleted
                          ? "text-slate-500"
                          : "text-slate-400"
                    }
                  `}
                >
                  {isActive
                    ? "Current step"
                    : canNavigate
                      ? "Open section"
                      : "Complete earlier steps"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
