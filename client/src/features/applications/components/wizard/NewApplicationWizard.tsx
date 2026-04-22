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
  useValidateSubmitApplicationMutation,
} from '../../api/applicationsApi';
import { STEPS } from '../../constants/formSteps';
import Button from '@/components/Button';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { faChartLine, faFile } from '@fortawesome/free-solid-svg-icons';
import { extractErrorMessage } from '@/features/auth/hooks/errorMessage';
import { extractPendingValidations } from '../../api/submitValidationErrors';

interface NewApplicationWizardProps {
  existingId?: string;
}

const TOTAL = STEPS.length;

export function NewApplicationWizard({ existingId }: NewApplicationWizardProps) {
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState<string | null>(existingId ?? null);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [canSubmit, setCanSubmit] = useState(false);
  const [pendingValidations, setPendingValidations] = useState<string[]>([]);

  const [createApplication, { isLoading: creating }] = useCreateApplicationMutation();
  const [validateSubmitApplication] = useValidateSubmitApplicationMutation();
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
      const validation = await validateSubmitApplication(applicationId).unwrap();
      if (validation.pendingValidations.length > 0) {
        setPendingValidations(validation.pendingValidations);
        toast.error('Submission blocked. Complete the listed requirements first.');
        return;
      }

      setPendingValidations([]);
      await submitApplication(applicationId).unwrap();
      navigate(`/applications/${applicationId}/submitted`);
    } catch (error) {
      const validations = extractPendingValidations(error);
      if (validations.length > 0) {
        setPendingValidations(validations);
        toast.error('Submission blocked. Complete the listed requirements first.');
        return;
      }

      toast.error(
        extractErrorMessage(
          error as never,
          'Submission failed. Please check all required fields and try again.',
        ),
      );
    }
  };

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
              {step === 5 && <Step5Documents applicationId={applicationId} />}
              {step === 6 && (
                <Step6Declaration
                  applicationId={applicationId}
                  initialData={application?.declaration ?? null}
                  application={application ?? null}
                  onCanSubmitChange={setCanSubmit}
                  pendingValidations={pendingValidations}
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
