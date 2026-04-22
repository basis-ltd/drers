import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SignatureCanvas from 'react-signature-canvas';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useUpdateDeclarationMutation } from '../../../api/applicationsApi';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { DECLARATION_TEXT } from '../../../constants/declarationText';
import { REVIEW_FEES, REVIEW_PATHWAY_LABELS } from '../../../constants/formSteps';
import type { Application, ApplicationDeclaration } from '../../../api/types';
import { selectAuthUser } from '@/features/auth/model/selectors';
import { SaveIndicator } from './Step1Details';
import Button from '@/components/Button';

const schema = z.object({
  agreed: z.literal(true, { errorMap: () => ({ message: 'You must accept the declaration' }) }),
});

type FormValues = z.infer<typeof schema>;

interface Step6DeclarationProps {
  applicationId: string;
  initialData: ApplicationDeclaration | null;
  application: Application | null;
  onCanSubmitChange: (can: boolean) => void;
  pendingValidations: string[];
}

export function Step6Declaration({
  applicationId,
  initialData,
  application,
  onCanSubmitChange,
  pendingValidations,
}: Step6DeclarationProps) {
  const user = useSelector(selectAuthUser);
  const [updateDeclaration] = useUpdateDeclarationMutation();
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [hasSig, setHasSig] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);

  const mutationFn = useCallback(
    ({ id, data }: { id: string; data: { agreed: boolean; signatureData?: string } }) =>
      updateDeclaration({
        id,
        data: {
          agreed:          data.agreed,
          signatureData:   data.signatureData,
          declarationText: DECLARATION_TEXT,
          signerName:      `${user?.firstName ?? ''} ${user?.surname ?? ''}`.trim(),
        },
      }).unwrap(),
    [updateDeclaration, user],
  );

  const { saveStatus, save } = useAutoSave<{ agreed: boolean; signatureData?: string }>(
    mutationFn,
    applicationId,
  );

  const { register, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agreed: (initialData?.agreed as true | false) === true ? true : undefined },
    mode: 'onBlur',
  });

  const agreed = watch('agreed');

  // Restore existing signature data
  useEffect(() => {
    if (initialData?.signatureData && sigPadRef.current) {
      sigPadRef.current.fromDataURL(initialData.signatureData);
      setHasSig(true);
    }
  }, [initialData?.signatureData]);

  // Notify parent whether submission is allowed
  useEffect(() => {
    onCanSubmitChange(!!agreed && hasSig);
  }, [agreed, hasSig, onCanSubmitChange]);

  const handleSigEnd = () => {
    if (!sigPadRef.current) return;
    const isEmpty = sigPadRef.current.isEmpty();
    setHasSig(!isEmpty);
    if (!isEmpty) {
      save({ agreed: !!agreed, signatureData: sigPadRef.current.toDataURL() });
    }
  };

  const clearSig = () => {
    sigPadRef.current?.clear();
    setHasSig(false);
  };

  const pathway = application?.details?.pathway ?? '';
  const fee = REVIEW_FEES[pathway];
  const pathwayLabel = REVIEW_PATHWAY_LABELS[pathway];

  const summaryItems = [
    { label: 'Study Title',     value: application?.details?.title      },
    { label: 'Research Area',   value: application?.details?.area       },
    { label: 'Study Type',      value: application?.details?.studyType  },
    { label: 'Review Pathway',  value: pathway                          },
    { label: 'Study Design',    value: application?.protocol?.design    },
    { label: 'Sample Size',     value: application?.protocol?.sampleSize != null ? String(application.protocol.sampleSize) : undefined },
    { label: 'Proposed Start',  value: application?.details?.startDate  },
    { label: 'Proposed End',    value: application?.details?.endDate    },
  ].filter((i) => Boolean(i.value));

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <header className="mb-6 flex items-center justify-between">
        <section>
          <h2 className="heading-section">Application Summary & Declaration</h2>
          <p className="mt-0.5 text-[11px] text-primary/50">
            Review your application details before signing and submitting.
          </p>
        </section>
        <SaveIndicator status={saveStatus} />
      </header>

      <section className="space-y-5">
        {pendingValidations.length > 0 && (
          <aside
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <p className="text-[12px] font-semibold text-red-700">
              Please complete the following before submitting:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-red-700">
              {pendingValidations.map((validation) => (
                <li key={validation}>{validation}</li>
              ))}
            </ul>
          </aside>
        )}

        {/* Summary accordion */}
        <article className="overflow-hidden rounded-lg border border-primary/10">
          <Button
            onClick={() => setSummaryOpen((o) => !o)}
            className="flex w-full items-center justify-between bg-background px-5 py-3.5 text-left transition-colors hover:bg-primary/4"
          >
            <span className="text-[12px] font-semibold text-primary">Application Summary</span>
            {summaryOpen
              ? <ChevronUp className="size-4 text-primary/40" aria-hidden />
              : <ChevronDown className="size-4 text-primary/40" aria-hidden />}
          </Button>
          {summaryOpen && (
            <section className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-primary/8 p-5">
              {summaryItems.map(({ label, value }) => (
                <section key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/35">{label}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-primary">{value}</p>
                </section>
              ))}
            </section>
          )}
        </article>

        {/* Review fee */}
        {pathway && (
          <aside
            role="note"
            className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-5 py-4"
          >
            <section>
              <p className="flex items-center gap-2 text-[12px] font-semibold text-blue-800">
                <Info className="size-3.5" aria-hidden /> Review Fee
              </p>
              <p className="mt-0.5 text-[11px] text-blue-700">
                {pathwayLabel} — New Application
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-blue-700/80">
                Payment instructions will be provided after submission.
              </p>
            </section>
            <p className="text-[18px] font-bold text-primary">{fee}</p>
          </aside>
        )}

        {/* Declaration text */}
        <fieldset>
          <legend className="mb-2 text-[12px] font-semibold text-primary">Declaration</legend>
          <blockquote
            className="max-h-56 overflow-y-auto rounded-lg border border-primary/10 bg-background px-5 py-4 text-[12px] leading-relaxed text-primary/70"
            style={{ whiteSpace: 'pre-line' }}
          >
            {DECLARATION_TEXT}
          </blockquote>
        </fieldset>

        {/* Agreement checkbox */}
        <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${agreed ? 'border-green-200 bg-green-50' : 'border-primary/15 hover:border-primary/25 hover:bg-background'}`}>
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-green-600"
            {...register('agreed')}
          />
          <span className="text-[12px] leading-relaxed text-primary/80">
            I have read and understood the declaration above. I confirm that all information
            provided is accurate and I agree to comply with RNEC ethics requirements.
          </span>
        </label>
        {errors.agreed && (
          <p className="text-[11px] text-red-600">{errors.agreed.message}</p>
        )}

        {/* Signature */}
        <fieldset>
          <header className="mb-2 flex items-center justify-between">
            <legend className="text-[12px] font-semibold text-primary">
              Digital Signature <span className="text-red-600">*</span>
            </legend>
            {hasSig && (
              <Button
                onClick={clearSig}
                variant="ghost"
                className="text-[11px] font-medium text-primary/40 hover:text-primary/70"
              >
                Clear signature
              </Button>
            )}
          </header>

          <section
            className={`overflow-hidden rounded-lg border transition-colors ${hasSig ? 'border-primary' : 'border-primary/20'}`}
          >
            <SignatureCanvas
              ref={sigPadRef}
              penColor="#0d1b2a"
              canvasProps={{
                className: 'w-full touch-none cursor-crosshair block',
                style: { height: 120 },
              }}
              onEnd={handleSigEnd}
            />
            {!hasSig && (
              <p
                aria-hidden
                className="pointer-events-none relative flex h-0 -translate-y-16 items-center justify-center text-[12px] italic text-primary/25"
              >
                Draw your signature here
              </p>
            )}
          </section>

          <section className="mt-2 flex justify-between text-[11px] text-primary/45">
            <span>Signatory: <strong className="text-primary">{user?.firstName} {user?.surname}</strong></span>
            <span>Date: <strong className="text-primary">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></span>
          </section>
        </fieldset>
      </section>
    </form>
  );
}
