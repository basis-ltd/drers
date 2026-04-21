import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import { useGetApplicationQuery } from '@/features/applications/api/applicationsApi';

const REDIRECT_DELAY_MS = 5000;

export function ApplicationSubmittedPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: application } = useGetApplicationQuery(id ?? '', {
    skip: !id,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/applications');
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  const nextSteps = [
    [
      'Payment Notification',
      'You will receive an invoice by email. Payment is required within 7 days to proceed to screening.',
    ],
    [
      'Administrative Screening',
      'Your documents will be checked for completeness (2-3 business days).',
    ],
    [
      'Reviewer Assignment',
      'Your application will be assigned to qualified reviewers.',
    ],
    [
      'Decision',
      "You will be notified of the committee's decision by email and in-app notification.",
    ],
  ] as const;

  return (
    <main className="flex min-h-full items-start justify-center px-4 py-16">
      <article className="w-full max-w-lg text-center">
        <figure className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="size-8 text-green-600" aria-hidden />
        </figure>

        <h1 className="mb-2 heading-page font-bold">
          Application Submitted Successfully
        </h1>
        {application?.referenceNumber ? (
          <p className="mb-1 text-[13px] leading-relaxed text-primary/60">
            Reference:{' '}
            <strong className="font-semibold text-primary">
              {application.referenceNumber}
            </strong>
          </p>
        ) : (
          <p className="mb-1 text-[13px] leading-relaxed text-primary/60">
            Your submission has been recorded successfully.
          </p>
        )}
        <p className="text-[13px] leading-relaxed text-primary/60">
          You will be redirected to My Applications in 5 seconds.
        </p>

        <section
          aria-label="Next steps"
          className="mb-7 mt-6 rounded-xl border border-primary/10 bg-background p-5 text-left"
        >
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
                  <p className="mt-0.5 text-[11px] leading-relaxed text-primary/55">
                    {desc}
                  </p>
                </section>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex justify-center">
          <Button
            primary
            value="View Applications"
            onClick={() => navigate('/applications')}
          />
        </section>
      </article>
    </main>
  );
}
