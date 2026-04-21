import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import CustomTooltip from "@/components/CustomTooltip";
import { useUpdateDetailsMutation } from "../../../api/applicationsApi";
import { useAutoSave } from "../../../hooks/useAutoSave";
import {
  RESEARCH_AREAS,
  STUDY_TYPES,
  REVIEW_PATHWAYS,
} from "../../../constants/formSteps";
import type {
  ApplicationDetails,
  ResearchArea,
  StudyType,
  ReviewPathway,
} from "../../../api/types";
import Combobox from "@/components/Combobox";

const schema = z.object({
  title: z.string().min(1, "Study title is required").max(500),
  area: z.string().min(1, "Research area is required"),
  funding: z.string().optional(),
  studyType: z.string().min(1, "Study type is required"),
  pathway: z.string().min(1, "Review pathway is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  multiCentre: z.string().min(1, "Please select an option"),
});

type FormValues = z.infer<typeof schema>;

interface Step1DetailsProps {
  applicationId: string;
  initialData: ApplicationDetails | null;
}

export function Step1Details({
  applicationId,
  initialData,
}: Step1DetailsProps) {
  const [updateDetails] = useUpdateDetailsMutation();

  const mutationFn = useCallback(
    ({ id, data }: { id: string; data: FormValues }) =>
      updateDetails({
        id,
        data: {
          title: data.title,
          area: data.area as ResearchArea,
          funding: data.funding || undefined,
          studyType: data.studyType as StudyType,
          pathway: data.pathway as ReviewPathway,
          startDate: data.startDate,
          endDate: data.endDate,
          multiCentre: data.multiCentre === "true",
        },
      }).unwrap(),
    [updateDetails],
  );

  const { saveStatus, save } = useAutoSave<FormValues>(
    mutationFn,
    applicationId,
  );

  const {
    control,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      area: initialData?.area ?? "",
      funding: initialData?.funding ?? "",
      studyType: initialData?.studyType ?? "",
      pathway: initialData?.pathway ?? "",
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
      multiCentre:
        initialData?.multiCentre != null ? String(initialData.multiCentre) : "",
    },
    mode: "onBlur",
  });

  const onBlurSave = () => save(getValues());

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <header className="mb-6 flex items-center justify-between">
        <section>
          <h2 className="heading-section">Application Details</h2>
          <p className="mt-0.5 text-[11px] text-primary/50">
            Provide the key identifying information for your research study.
          </p>
        </section>
        <SaveIndicator status={saveStatus} />
      </header>

      <section className="space-y-5">
        {/* Study title */}
        <fieldset>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                label="Study Title"
                required
                placeholder="e.g. Efficacy of Community-Based Malaria Prevention Interventions in Rural Rwanda"
                errorMessage={errors.title?.message}
                {...field}
              />
            )}
          />
        </fieldset>

        {/* Research area + Funding */}
        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend className="sr-only">Study classification</legend>
          <Controller
            name="area"
            control={control}
            render={({ field }) => (
              <Select
                label="Research Area"
                required
                options={RESEARCH_AREAS}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onBlurSave();
                }}
                errorMessage={errors.area?.message}
              />
            )}
          />
          <Controller
            name="funding"
            control={control}
            render={({ field }) => (
              <Input
                label="Funding Source"
                placeholder="e.g. WHO, NIH, institutional budget, self-funded"
                errorMessage={errors.funding?.message}
                {...field}
              />
            )}
          />
        </fieldset>

        {/* Study type */}
        <fieldset className="space-y-2">
          <Controller
            name="studyType"
            control={control}
            render={({ field }) => (
              <Combobox
                label="Study Type"
                required
                options={STUDY_TYPES}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onBlurSave();
                }}
                errorMessage={errors.studyType?.message}
              />
            )}
          />
        </fieldset>

        {/* Review pathway */}
        <fieldset className="space-y-2">
          <legend className="pl-1 text-[11px] font-light leading-tight text-primary lg:text-[12px]">
            Requested Review Pathway{" "}
            <CustomTooltip label="The pathway determines the review process and timeline. Select based on the level of risk to participants.">
              <span className="cursor-help text-red-600">*</span>
            </CustomTooltip>
          </legend>
          <Controller
            name="pathway"
            control={control}
            render={({ field }) => (
              <Combobox
                label="Requested Review Pathway"
                required
                options={REVIEW_PATHWAYS}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onBlurSave();
                }}
                errorMessage={errors.pathway?.message}
              />
            )}
          />
        </fieldset>

        {/* Dates + Multi-centre */}
        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <legend className="sr-only">Study dates and location</legend>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Input
                label="Proposed Start Date"
                required
                type="date"
                errorMessage={errors.startDate?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Input
                label="Proposed End Date"
                required
                type="date"
                errorMessage={errors.endDate?.message}
                {...field}
                onBlur={() => {
                  field.onBlur();
                  onBlurSave();
                }}
              />
            )}
          />
        </fieldset>
      </section>
    </form>
  );
}

// ── Save status indicator ──────────────────────────────────────────────────────
function SaveIndicator({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error";
}) {
  if (status === "idle") return null;
  return (
    <output
      aria-live="polite"
      className="flex items-center gap-1.5 text-[11px]"
    >
      {status === "saving" && (
        <>
          <Loader2
            className="size-3 animate-spin text-primary/40"
            aria-hidden
          />
          <span className="text-primary/40">Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle className="size-3 text-green-600" aria-hidden />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === "error" && <span className="text-red-500">Save failed</span>}
    </output>
  );
}

export { SaveIndicator };
