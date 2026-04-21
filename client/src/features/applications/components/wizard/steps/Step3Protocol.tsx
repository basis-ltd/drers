import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import { useUpdateProtocolMutation } from '../../../api/applicationsApi';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { STUDY_DESIGNS } from '../../../constants/formSteps';
import type { ApplicationProtocol, StudyDesign } from '../../../api/types';
import { SaveIndicator } from './Step1Details';
import Combobox from '@/components/Combobox';

const schema = z.object({
  background:           z.string().min(1, 'Background & rationale is required'),
  primaryObjective:     z.string().min(1, 'Primary objective is required'),
  secondaryObjectives:  z.string().optional(),
  design:               z.string().min(1, 'Study design is required'),
  duration:             z.string().optional(),
  sampleSize:           z.string().min(1, 'Sample size is required'),
  statPower:            z.string().optional(),
  population:           z.string().min(1, 'Study population is required'),
  inclusionCriteria:    z.string().min(1, 'Inclusion criteria is required'),
  exclusionCriteria:    z.string().min(1, 'Exclusion criteria is required'),
  recruitment:          z.string().min(1, 'Recruitment method is required'),
  procedures:           z.string().min(1, 'Study procedures is required'),
});

type FormValues = z.infer<typeof schema>;

interface Step3ProtocolProps {
  applicationId: string;
  initialData: ApplicationProtocol | null;
}

export function Step3Protocol({ applicationId, initialData }: Step3ProtocolProps) {
  const [updateProtocol] = useUpdateProtocolMutation();

  const mutationFn = useCallback(
    ({ id, data }: { id: string; data: FormValues }) =>
      updateProtocol({
        id,
        data: {
          background:          data.background,
          primaryObjective:    data.primaryObjective,
          secondaryObjectives: data.secondaryObjectives || undefined,
          design:              data.design as StudyDesign,
          duration:            data.duration || undefined,
          sampleSize:          data.sampleSize ? Number(data.sampleSize) : undefined,
          statPower:           data.statPower  || undefined,
          population:          data.population,
          inclusionCriteria:   data.inclusionCriteria,
          exclusionCriteria:   data.exclusionCriteria,
          recruitment:         data.recruitment,
          procedures:          data.procedures,
        },
      }).unwrap(),
    [updateProtocol],
  );

  const { saveStatus, save } = useAutoSave<FormValues>(mutationFn, applicationId);

  const { control, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      background:          initialData?.background          ?? '',
      primaryObjective:    initialData?.primaryObjective    ?? '',
      secondaryObjectives: initialData?.secondaryObjectives ?? '',
      design:              initialData?.design              ?? '',
      duration:            initialData?.duration            ?? '',
      sampleSize:          initialData?.sampleSize != null ? String(initialData.sampleSize) : '',
      statPower:           initialData?.statPower           ?? '',
      population:          initialData?.population          ?? '',
      inclusionCriteria:   initialData?.inclusionCriteria   ?? '',
      exclusionCriteria:   initialData?.exclusionCriteria   ?? '',
      recruitment:         initialData?.recruitment         ?? '',
      procedures:          initialData?.procedures          ?? '',
    },
    mode: 'onBlur',
  });

  const onBlurSave = () => save(getValues());

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <header className="mb-6 flex items-center justify-between">
        <section>
          <h2 className="heading-section">Study Protocol</h2>
          <p className="mt-0.5 text-[11px] text-primary/50">
            Describe the scientific and methodological aspects of your research.
          </p>
        </section>
        <SaveIndicator status={saveStatus} />
      </header>

      <section className="space-y-5">
        <fieldset>
          <Controller name="background" control={control} render={({ field }) => (
          <TextArea
            label="Background & Rationale"
            required
            rows={5}
            placeholder="Provide context for your study, summarise existing evidence, and explain why this research is needed…"
            value={getValues('background')}
            errorMessage={errors.background?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>

        <fieldset>
          <Controller name="primaryObjective" control={control} render={({ field }) => (
          <TextArea
            label="Primary Objective"
            required
            rows={3}
            placeholder="e.g. To determine the efficacy of…"
            value={getValues('primaryObjective')}
            errorMessage={errors.primaryObjective?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>

        <fieldset>
          <Controller name="secondaryObjectives" control={control} render={({ field }) => (
          <TextArea
            label="Secondary Objectives"
            rows={3}
            placeholder="e.g. To assess the safety of… / To compare outcomes between…"
            value={getValues('secondaryObjectives')}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend className="sr-only">Study design parameters</legend>
          <Controller
            name="design"
            control={control}
            render={({ field }) => (
              <Combobox
                label="Study Design"
                required
                options={STUDY_DESIGNS}
                placeholder="Select study design…"
                value={field.value}
                onChange={(v) => { field.onChange(v); onBlurSave(); }}
                errorMessage={errors.design?.message}
              />
            )}
          />
          <Controller name="duration" control={control} render={({ field }) => (
          <Input
            label="Study Duration"
            placeholder="e.g. 12 months"
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
          <Controller name="sampleSize" control={control} render={({ field }) => (
          <Input
            label="Target Sample Size"
            required
            type="number"
            placeholder="e.g. 250"
            errorMessage={errors.sampleSize?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
          <Controller name="statPower" control={control} render={({ field }) => (
          <Input
            label="Statistical Power / Significance Level"
            placeholder="e.g. 80% power, α = 0.05"
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>

        <fieldset>
          <Controller name="population" control={control} render={({ field }) => (
          <TextArea
            label="Target Study Population"
            required
            rows={3}
            placeholder="e.g. Adults aged 18–60 attending outpatient services at district hospitals in Southern Province…"
            value={getValues('population')}
            errorMessage={errors.population?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend className="sr-only">Eligibility criteria</legend>
          <Controller name="inclusionCriteria" control={control} render={({ field }) => (
          <TextArea
            label="Inclusion Criteria"
            required
            rows={4}
            placeholder="List each criterion on a new line…"
            value={getValues('inclusionCriteria')}
            errorMessage={errors.inclusionCriteria?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
          <Controller name="exclusionCriteria" control={control} render={({ field }) => (
          <TextArea
            label="Exclusion Criteria"
            required
            rows={4}
            placeholder="List each criterion on a new line…"
            value={getValues('exclusionCriteria')}
            errorMessage={errors.exclusionCriteria?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>

        <fieldset>
          <Controller name="recruitment" control={control} render={({ field }) => (
          <Combobox
            label="Recruitment Method & Timeline"
            required
            options={STUDY_DESIGNS}
            placeholder="Select recruitment method…"
            value={field.value}
            onChange={(v) => { field.onChange(v); onBlurSave(); }}
            errorMessage={errors.recruitment?.message}
          />
          )} />
        </fieldset>

        <fieldset>
          <Controller name="procedures" control={control} render={({ field }) => (
          <TextArea
            label="Study Procedures / Interventions"
            required
            rows={4}
            placeholder="Describe the procedures in order, including any interventions, questionnaires, biological samples, follow-up visits…"
            value={getValues('procedures')}
            errorMessage={errors.procedures?.message}
            {...field}
            onBlur={() => {
              field.onBlur();
              onBlurSave();
            }}
          />
          )} />
        </fieldset>
      </section>
    </form>
  );
}
