import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { WizardStepper } from './WizardStepper';
import { Step1Details } from './steps/Step1Details';
import { Step2Team } from './steps/Step2Team';
import { Step3Protocol } from './steps/Step3Protocol';
import { Step4Ethics } from './steps/Step4Ethics';
import { Step5Documents } from './steps/Step5Documents';
import { Step6Declaration } from './steps/Step6Declaration';
import {
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useSubmitApplicationMutation,
} from '../../api/applicationsApi';
import { STEPS } from '../../constants/formSteps';
import type { Application } from '../../api/types';
import Button from '@/components/Button';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { faChartLine, faFile } from '@fortawesome/free-solid-svg-icons';

interface NewApplicationWizardProps {
  existingId?: string;
}

const TOTAL = STEPS.length;

export function NewApplicationWizard({ existingId }: NewApplicationWizardProps) {
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState<string | null>(existingId ?? null);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const [createApplication, { isLoading: creating }] = useCreateApplicationMutation();
  const [submitApplication, { isLoading: submitting }] = useSubmitApplicationMutation();

  const { data: application, isLoading: loadingApp } = useGetApplicationQuery(
    applicationId ?? '',
    { skip: !applicationId },
  );

  // Create draft on mount for new applications
  useEffect(() => {
    if (existingId || applicationId) return;

    createApplication({ type: 'NEW' })
      .unwrap()
      .then(({ id }) => {
        setApplicationId(id);
        navigate(`/applications/${id}/edit`, { replace: true });
      })
      .catch(() => {
        toast.error('Failed to create application draft. Please try again.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markCompleted = (n: number) => {
    setCompleted((prev) => new Set(prev).add(n));
  };

  const next = () => {
    markCompleted(step);
    if (step < TOTAL) {
      goTo(step + 1);
    }
  };

  const back = () => {
    if (step > 1) goTo(step - 1);
  };

  const handleSubmit = async () => {
    if (!applicationId) return;
    try {
      await submitApplication(applicationId).unwrap();
      setSubmitted(true);
    } catch {
      toast.error('Submission failed. Please check all required fields and try again.');
    }
  };

  // ── Submitted success screen ───────────────────────────────────────────────
  if (submitted && application) {
    return <SubmitSuccessScreen application={application} onNavigate={navigate} />;
  }

  const isLoading = creating || loadingApp;

  return (
    <main className="min-h-full px-4 py-6 md:px-8 md:py-8">
      {/* Page header / breadcrumb */}
      <CustomBreadcrumb
        navigationLinks={[
          { label: 'Dashboard', route: '/dashboard', icon: faChartLine },
          { label: 'New Protocol Submission', route: '#', icon: faFile },
        ]}
      />

      {/* Wizard card */}
      <article className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
        {/* Stepper */}
        <section aria-label="Progress steps" className="border-b border-primary/8">
          <WizardStepper current={step} completed={completed} onGoto={goTo} />
        </section>

        {/* Progress bar */}
        <meter
          value={step - 1}
          max={TOTAL}
          aria-label={`Step ${step} of ${TOTAL}`}
          className="block h-0.5 w-full appearance-none bg-primary/8 [&::-webkit-meter-bar]:h-full [&::-webkit-meter-bar]:rounded-none [&::-webkit-meter-bar]:bg-primary/8 [&::-webkit-meter-optimum-value]:bg-gradient-to-r [&::-webkit-meter-optimum-value]:from-primary [&::-webkit-meter-optimum-value]:to-accent"
          style={{
            background: `linear-gradient(to right, var(--primary) ${((step - 1) / TOTAL) * 100}%, color-mix(in srgb, var(--primary) 8%, transparent) 0%)`,
          }}
        />

        {/* Step content */}
        <section
          aria-label={`Step ${step} content`}
          className="px-6 py-7 md:px-8"
        >
          {isLoading ? (
            <StepSkeleton />
          ) : applicationId ? (
            <>
              {step === 1 && (
                <Step1Details
                  applicationId={applicationId}
                  initialData={application?.details ?? null}
                />
              )}
              {step === 2 && (
                <Step2Team
                  applicationId={applicationId}
                  initialData={application?.team ?? null}
                  coInvestigators={application?.coInvestigators ?? []}
                  studySites={application?.studySites ?? []}
                />
              )}
              {step === 3 && (
                <Step3Protocol
                  applicationId={applicationId}
                  initialData={application?.protocol ?? null}
                />
              )}
              {step === 4 && (
                <Step4Ethics
                  applicationId={applicationId}
                  initialData={application?.ethics ?? null}
                />
              )}
              {step === 5 && <Step5Documents />}
              {step === 6 && (
                <Step6Declaration
                  applicationId={applicationId}
                  initialData={application?.declaration ?? null}
                  application={application ?? null}
                  onCanSubmitChange={setCanSubmit}
                />
              )}
            </>
          ) : null}
        </section>

        {/* Navigation footer */}
        <footer className="flex items-center justify-between border-t border-primary/8 bg-background/50 px-6 py-4 md:px-8">
          <section>
            {step > 1 && (
              <Button
                onClick={back}
                icon={ArrowLeft as never}
                value="Back"
                className="text-[11px]"
              />
            )}
          </section>

          <section className="flex items-center gap-3">
            <span className="text-[11px] text-primary/40">
              Step {step} of {TOTAL}
            </span>

            {step < TOTAL ? (
              <Button
                onClick={next}
                primary
                value="Save & Continue"
                icon={ChevronRight as never}
                className="text-[11px]"
              />
            ) : (
              <Button
                onClick={handleSubmit}
                submit
                disabled={!canSubmit || submitting}
                isLoading={submitting}
                icon={CheckCircle as never}
                value="Submit Application"
                primary
                className="text-[11px]"
              />
            )}
          </section>
        </footer>
      </article>
    </main>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function StepSkeleton() {
  return (
    <section aria-label="Loading" className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="block h-9 w-full animate-pulse rounded-md bg-primary/6" />
      ))}
    </section>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────────
interface SubmitSuccessScreenProps {
  application: Application;
  onNavigate: (path: string) => void;
}

function SubmitSuccessScreen({ application, onNavigate }: SubmitSuccessScreenProps) {
  const nextSteps = [
    ['Payment Notification', 'You will receive an invoice by email. Payment is required within 7 days to proceed to screening.'],
    ['Administrative Screening', 'Your documents will be checked for completeness (2–3 business days).'],
    ['Reviewer Assignment', 'Your application will be assigned to qualified reviewers.'],
    ['Decision', "You will be notified of the committee's decision by email and in-app notification."],
  ] as const;

  return (
    <main className="flex min-h-full items-start justify-center px-4 py-16">
      <article className="w-full max-w-lg text-center">
        <figure className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="size-8 text-green-600" aria-hidden />
        </figure>

        <h2 className="mb-2 heading-page font-bold">
          Application Submitted Successfully
        </h2>
        <p className="mb-1 text-[13px] leading-relaxed text-primary/60">
          Reference:{' '}
          <strong className="font-semibold text-primary">{application.referenceNumber}</strong>
        </p>
        <p className="text-[13px] leading-relaxed text-primary/60">
          Your research ethics application has been received.
        </p>

        <section aria-label="Next steps" className="mb-7 mt-6 rounded-xl border border-primary/10 bg-background p-5 text-left">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-primary/40">
            What happens next
          </p>
          <ol className="space-y-4">
            {nextSteps.map(([title, desc], i) => (
              <li key={i} className="flex gap-3">
                <figure
                  aria-hidden
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {i + 1}
                </figure>
                <section>
                  <p className="text-[12px] font-semibold text-primary">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-primary/55">{desc}</p>
                </section>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex justify-center gap-3">
          <Button primary value="Go to Dashboard" onClick={() => onNavigate('/dashboard')} />
          <Button value="View Applications" onClick={() => onNavigate('/applications')} />
        </section>
      </article>
    </main>
  );
}
