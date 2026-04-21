import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextArea from "@/components/TextArea";
import { useUpdateEthicsMutation } from "../../../api/applicationsApi";
import { useAutoSave } from "../../../hooks/useAutoSave";
import {
  VULNERABLE_POPULATIONS,
  CONSENT_WAIVER_OPTIONS,
  CONFLICT_OF_INTEREST_OPTIONS,
} from "../../../constants/formSteps";
import type {
  ApplicationEthics,
  ConsentWaiver,
  ConflictOfInterest,
} from "../../../api/types";
import { SaveIndicator } from "./Step1Details";

const schema = z.object({
  risks: z.string().min(1, "Risks description is required"),
  riskMitigation: z.string().min(1, "Risk mitigation is required"),
  benefits: z.string().min(1, "Expected benefits is required"),
  vulnerablePopulations: z
    .array(z.string())
    .min(1, "Please select at least one option"),
  consentProcess: z.string().min(1, "Consent process is required"),
  consentWaiver: z.string().min(1, "Please select an option"),
  consentWaiverJustification: z.string().optional(),
  dataStorage: z.string().min(1, "Data storage plan is required"),
  confidentiality: z.string().min(1, "Confidentiality plan is required"),
  conflictOfInterest: z.string().min(1, "Please declare conflict of interest"),
  conflictOfInterestDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step4EthicsProps {
  applicationId: string;
  initialData: ApplicationEthics | null;
}

export function Step4Ethics({ applicationId, initialData }: Step4EthicsProps) {
  const [updateEthics] = useUpdateEthicsMutation();

  const mutationFn = useCallback(
    ({ id, data }: { id: string; data: FormValues }) =>
      updateEthics({
        id,
        data: {
          risks: data.risks,
          riskMitigation: data.riskMitigation,
          benefits: data.benefits,
          vulnerablePopulations: data.vulnerablePopulations,
          consentProcess: data.consentProcess,
          consentWaiver: data.consentWaiver as ConsentWaiver,
          consentWaiverJustification:
            data.consentWaiverJustification || undefined,
          dataStorage: data.dataStorage,
          confidentiality: data.confidentiality,
          conflictOfInterest: data.conflictOfInterest as ConflictOfInterest,
          conflictOfInterestDescription:
            data.conflictOfInterestDescription || undefined,
        },
      }).unwrap(),
    [updateEthics],
  );

  const { saveStatus, save } = useAutoSave<FormValues>(
    mutationFn,
    applicationId,
  );

  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      risks: initialData?.risks ?? "",
      riskMitigation: initialData?.riskMitigation ?? "",
      benefits: initialData?.benefits ?? "",
      vulnerablePopulations: initialData?.vulnerablePopulations ?? [],
      consentProcess: initialData?.consentProcess ?? "",
      consentWaiver: initialData?.consentWaiver ?? "",
      consentWaiverJustification: initialData?.consentWaiverJustification ?? "",
      dataStorage: initialData?.dataStorage ?? "",
      confidentiality: initialData?.confidentiality ?? "",
      conflictOfInterest: initialData?.conflictOfInterest ?? "",
      conflictOfInterestDescription:
        initialData?.conflictOfInterestDescription ?? "",
    },
    mode: "onBlur",
  });

  const onBlurSave = () => save(getValues());
  const consentWaiver = watch("consentWaiver");
  const conflictOfInterest = watch("conflictOfInterest");

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <header className="mb-6 flex items-center justify-between">
        <section>
          <h2 className="heading-section">Ethical Considerations</h2>
          <p className="mt-0.5 text-[11px] text-primary/50">
            Describe how you will protect participants and uphold ethical
            principles.
          </p>
        </section>
        <SaveIndicator status={saveStatus} />
      </header>

      <section className="space-y-5">
        {/* Risks + Mitigation */}
        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend className="sr-only">Risk assessment</legend>
          <Controller
            name="risks"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Potential Risks to Participants"
                required
                rows={4}
                placeholder="e.g. Mild discomfort from blood draw; potential psychological distress from sensitive questions…"
                value={field.value}
                errorMessage={errors.risks?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
          <Controller
            name="riskMitigation"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Risk Mitigation Measures"
                required
                rows={4}
                placeholder="e.g. Trained phlebotomists; referral pathway for psychological distress…"
                value={field.value}
                errorMessage={errors.riskMitigation?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
        </fieldset>

        {/* Benefits */}
        <fieldset>
          <Controller
            name="benefits"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Expected Benefits"
                required
                rows={3}
                placeholder="e.g. Participants receive free screening; findings will inform national health policy…"
                errorMessage={errors.benefits?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
        </fieldset>

        {/* Vulnerable populations */}
        <fieldset className="space-y-2">
          <legend className="pl-1 text-[11px] font-light leading-tight text-primary lg:text-[12px]">
            Vulnerable Populations Involved{" "}
            <span className="text-red-600">*</span>
          </legend>
          <Controller
            name="vulnerablePopulations"
            control={control}
            render={({ field }) => (
              <ul className="space-y-2">
                {VULNERABLE_POPULATIONS.map((opt) => {
                  const checked = field.value.includes(opt);
                  return (
                    <li key={opt}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${checked ? "border-accent/40 bg-accent/5" : "border-primary/15 hover:border-primary/25 hover:bg-background"}`}
                      >
                        <input
                          type="checkbox"
                          className="accent-accent"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...field.value, opt]
                              : field.value.filter((v) => v !== opt);
                            field.onChange(next);
                            setTimeout(onBlurSave, 0);
                          }}
                        />
                        <span className="text-[12px] text-primary/80">
                          {opt}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          />
          {errors.vulnerablePopulations && (
            <p className="text-[11px] text-red-600">
              {errors.vulnerablePopulations.message}
            </p>
          )}
        </fieldset>

        {/* Consent process */}
        <fieldset>
          <Controller
            name="consentProcess"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Informed Consent Process"
                required
                rows={4}
                placeholder="Describe who obtains consent, the language used, how questions are addressed, and the opportunity to withdraw…"
                value={field.value}
                errorMessage={errors.consentProcess?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
        </fieldset>

        {/* Consent waiver */}
        <fieldset className="space-y-2">
          <legend className="pl-1 text-[11px] font-light leading-tight text-primary lg:text-[12px]">
            Consent Waiver Requested? <span className="text-red-600">*</span>
          </legend>
          <ul className="space-y-2">
            <Controller
              name="consentWaiver"
              control={control}
              render={({ field }) => (
                <ul className="space-y-2">
                  {CONSENT_WAIVER_OPTIONS.map(({ value, label }) => (
                    <li key={value}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/15 p-3 transition-colors hover:bg-background has-[:checked]:border-accent/40 has-[:checked]:bg-accent/5">
                        <input
                          type="radio"
                          value={value}
                          className="accent-accent"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            onBlurSave();
                          }}
                        />
                        <span className="text-[12px] text-primary/80">
                          {label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            />
          </ul>
          {errors.consentWaiver && (
            <p className="text-[11px] text-red-600">
              {errors.consentWaiver.message}
            </p>
          )}
        </fieldset>

        {consentWaiver === "YES" && (
          <fieldset>
            <Controller
              name="consentWaiverJustification"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Justification for Consent Waiver"
                  required
                  rows={4}
                  placeholder="Explain why informed consent cannot feasibly be obtained and how participant interests will still be protected…"
                  value={getValues("consentWaiverJustification")}
                  errorMessage={errors.consentWaiverJustification?.message}
                  {...field}
                  onBlur={() => {
                    field.onBlur();
                    onBlurSave();
                  }}
                />
              )}
            />
          </fieldset>
        )}

        {/* Data storage + Confidentiality */}
        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend className="sr-only">Data protection</legend>
          <Controller
            name="dataStorage"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Data Storage & Security Plan"
                required
                rows={4}
                placeholder="Describe where data will be stored, for how long, who will have access, and how it will be secured…"
                value={getValues("dataStorage")}
                errorMessage={errors.dataStorage?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
          <Controller
            name="confidentiality"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Confidentiality & Anonymisation"
                required
                rows={4}
                placeholder="Describe how participant identity will be protected in data collection, storage, and reporting…"
                value={getValues("confidentiality")}
                errorMessage={errors.confidentiality?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
        </fieldset>

        {/* Conflict of interest */}
        <fieldset className="space-y-2">
          <legend className="pl-1 text-[11px] font-light leading-tight text-primary lg:text-[12px]">
            Conflict of Interest Declaration{" "}
            <span className="text-red-600">*</span>
          </legend>
          <ul className="space-y-2">
            <Controller
              name="conflictOfInterest"
              control={control}
              render={({ field }) => (
                <ul className="space-y-2">
                  {CONFLICT_OF_INTEREST_OPTIONS.map(({ value, label }) => (
                    <li key={value}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/15 p-3 transition-colors hover:bg-background has-[:checked]:border-accent/40 has-[:checked]:bg-accent/5">
                        <input
                          type="radio"
                          value={value}
                          className="accent-accent"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            onBlurSave();
                          }}
                        />
                        <span className="text-[12px] text-primary/80">
                          {label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            />
          </ul>
          {errors.conflictOfInterest && (
            <p className="text-[11px] text-red-600">
              {errors.conflictOfInterest.message}
            </p>
          )}
        </fieldset>

        {conflictOfInterest === "YES" && (
          <fieldset>
            <Controller
              name="conflictOfInterestDescription"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Describe the Conflict of Interest"
                  required
                  rows={3}
                  placeholder="Describe the nature of the conflict and how it will be managed…"
                  value={getValues("conflictOfInterestDescription")}
                  errorMessage={errors.conflictOfInterestDescription?.message}
                  {...field}
                  onBlur={() => {
                    field.onBlur();
                    onBlurSave();
                  }}
                />
              )}
            />
          </fieldset>
        )}
      </section>
    </form>
  );
}
