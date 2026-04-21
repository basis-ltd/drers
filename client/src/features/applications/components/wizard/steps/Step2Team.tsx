import { useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { selectAuthUser } from '@/features/auth/model/selectors';
import { useUpdateTeamMutation } from '../../../api/applicationsApi';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { PROFESSIONAL_TITLES } from '../../../constants/formSteps';
import type { ApplicationTeam, CoInvestigator, StudySite, ProfessionalTitle } from '../../../api/types';
import { SaveIndicator } from './Step1Details';

const coInvSchema = z.object({
  title:       z.string().optional(),
  name:        z.string().min(1, 'Name is required'),
  institution: z.string().optional(),
  role:        z.string().optional(),
});

const siteSchema = z.object({
  name:     z.string().min(1, 'Site name is required'),
  location: z.string().optional(),
});

const schema = z.object({
  piDepartment: z.string().optional(),
  piInstitution: z.string().optional(),
  piPhone:      z.string().optional(),
  piNhra:       z.string().optional(),
  coInvestigators: z.array(coInvSchema),
  studySites:      z.array(siteSchema),
});

type FormValues = z.infer<typeof schema>;

interface Step2TeamProps {
  applicationId: string;
  initialData: ApplicationTeam | null;
  coInvestigators: CoInvestigator[];
  studySites: StudySite[];
}

export function Step2Team({
  applicationId,
  initialData,
  coInvestigators,
  studySites,
}: Step2TeamProps) {
  const user = useSelector(selectAuthUser);
  const [updateTeam] = useUpdateTeamMutation();

  const mutationFn = useCallback(
    ({ id, data }: { id: string; data: FormValues }) =>
      updateTeam({
        id,
        data: {
          piDepartment: data.piDepartment || undefined,
          piInstitution: data.piInstitution || undefined,
          piPhone:      data.piPhone      || undefined,
          piNhra:       data.piNhra       || undefined,
          coInvestigators: data.coInvestigators.map((c) => ({
            title:       (c.title as ProfessionalTitle) || undefined,
            name:        c.name,
            institution: c.institution || undefined,
            role:        c.role        || undefined,
          })),
          studySites: data.studySites.map((s) => ({
            name:     s.name,
            location: s.location || undefined,
          })),
        },
      }).unwrap(),
    [updateTeam],
  );

  const { saveStatus, save } = useAutoSave<FormValues>(mutationFn, applicationId);

  const { register, control, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      piDepartment: initialData?.piDepartment ?? '',
      piInstitution: initialData?.piInstitution ?? '',
      piPhone:      initialData?.piPhone      ?? '',
      piNhra:       initialData?.piNhra       ?? '',
      coInvestigators: coInvestigators.map((c) => ({
        title:       c.title ?? '',
        name:        c.name,
        institution: c.institution ?? '',
        role:        c.role ?? '',
      })),
      studySites: studySites.map((s) => ({
        name:     s.name,
        location: s.location ?? '',
      })),
    },
    mode: 'onBlur',
  });

  const {
    fields: coIFields,
    append: appendCoI,
    remove: removeCoI,
  } = useFieldArray({ control, name: 'coInvestigators' });

  const {
    fields: siteFields,
    append: appendSite,
    remove: removeSite,
  } = useFieldArray({ control, name: 'studySites' });

  const onBlurSave = () => save(getValues());

  const addCoInvestigator = () => {
    appendCoI({ title: '', name: '', institution: '', role: '' });
    setTimeout(() => save(getValues()), 0);
  };

  const removeCoInvestigator = (idx: number) => {
    removeCoI(idx);
    setTimeout(() => save(getValues()), 0);
  };

  const addSite = () => {
    appendSite({ name: '', location: '' });
    setTimeout(() => save(getValues()), 0);
  };

  const removeSiteRow = (idx: number) => {
    removeSite(idx);
    setTimeout(() => save(getValues()), 0);
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <header className="mb-6 flex items-center justify-between">
        <section>
          <h2 className="heading-section">Research Team</h2>
          <p className="mt-0.5 text-[11px] text-primary/50">
            Add all researchers involved in carrying out this study.
          </p>
        </section>
        <SaveIndicator status={saveStatus} />
      </header>

      <section className="space-y-7">
        {/* Principal Investigator */}
        <fieldset className="rounded-lg border border-primary/10 bg-background p-5">
          <legend className="mb-4 text-[12px] font-semibold text-primary">Principal Investigator</legend>

          {/* PI identity chip */}
          <section className="mb-4 flex items-center gap-3 rounded-md border border-primary/10 bg-white p-3">
            <figure className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
              {initials}
            </figure>
            <section>
              <p className="text-[12px] font-semibold text-primary">
                {user?.firstName} {user?.surname}
              </p>
              <p className="text-[11px] text-primary/50">Principal Investigator</p>
            </section>
            <output className="ml-auto rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
              From profile
            </output>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Department / Unit"
              placeholder="e.g. Department of Internal Medicine"
              {...register('piDepartment', { onBlur: onBlurSave })}
            />
            <Input
              label="Institutional Affiliation"
              required
              placeholder="e.g. University of Rwanda"
              {...register('piInstitution', { onBlur: onBlurSave })}
            />
            <Input
              label="Phone Number"
              required
              type="tel"
              placeholder="+250 7XX XXX XXX"
              errorMessage={errors.piPhone?.message}
              {...register('piPhone', { onBlur: onBlurSave })}
            />
            <Input
              label="NHRA Researcher ID"
              placeholder="e.g. NHRA/RES/2024/XXXX"
              {...register('piNhra', { onBlur: onBlurSave })}
            />
          </section>
        </fieldset>

        {/* Co-Investigators */}
        <fieldset>
          <legend className="mb-1 text-[13px] font-semibold text-primary">Co-Investigators</legend>
          <p className="mb-3 text-[11px] text-primary/50">
            Add all researchers who will be involved in carrying out the study.
          </p>

          <ul className="space-y-3">
            {coIFields.map((field, idx) => (
              <li
                key={field.id}
                className="rounded-lg border border-primary/10 bg-background p-4"
              >
                <header className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/40">
                    Co-Investigator {idx + 1}
                  </p>
                  <Button
                    onClick={() => removeCoInvestigator(idx)}
                    variant="icon"
                    value={<Trash2 className="size-3.5" aria-hidden />}
                    className="size-7 border-none text-primary/30 hover:bg-red-50 hover:text-red-500"
                  >
                    <span className="sr-only">{`Remove co-investigator ${idx + 1}`}</span>
                  </Button>
                </header>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Controller
                    name={`coInvestigators.${idx}.title`}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        label="Title"
                        options={[{ value: '', label: '—' }, ...PROFESSIONAL_TITLES]}
                        value={f.value}
                        onChange={(v) => { f.onChange(v); onBlurSave(); }}
                      />
                    )}
                  />
                  <Input
                    label="Full Name"
                    required
                    placeholder="Full name"
                    errorMessage={(errors.coInvestigators?.[idx] as { name?: { message?: string } })?.name?.message}
                    {...register(`coInvestigators.${idx}.name`, { onBlur: onBlurSave })}
                  />
                  <Input
                    label="Institution"
                    placeholder="Institution"
                    {...register(`coInvestigators.${idx}.institution`, { onBlur: onBlurSave })}
                  />
                  <Input
                    label="Role"
                    placeholder="e.g. Statistician"
                    {...register(`coInvestigators.${idx}.role`, { onBlur: onBlurSave })}
                  />
                </section>
              </li>
            ))}
          </ul>

          <Button
            onClick={addCoInvestigator}
            className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-accent/40 bg-white px-4 py-2.5 text-[12px] font-medium text-accent transition-colors hover:border-accent hover:bg-accent/5"
          >
            <Plus className="size-3.5" aria-hidden />
            Add Co-Investigator
          </Button>
        </fieldset>

        {/* Study Sites */}
        <fieldset>
          <legend className="mb-1 text-[13px] font-semibold text-primary">Study Sites</legend>
          <p className="mb-3 text-[11px] text-primary/50">
            List all facilities or locations where the study will be conducted.
          </p>

          <ul className="space-y-2">
            {siteFields.map((field, idx) => (
              <li key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <Input
                  label={idx === 0 ? 'Site Name' : undefined}
                  placeholder="e.g. CHUK, Kigali"
                  errorMessage={(errors.studySites?.[idx] as { name?: { message?: string } })?.name?.message}
                  {...register(`studySites.${idx}.name`, { onBlur: onBlurSave })}
                />
                <Input
                  label={idx === 0 ? 'Location / District' : undefined}
                  placeholder="e.g. Nyarugenge, Kigali"
                  {...register(`studySites.${idx}.location`, { onBlur: onBlurSave })}
                />
                <Button
                  onClick={() => removeSiteRow(idx)}
                  variant="icon"
                  value={<Trash2 className="size-3.5" aria-hidden />}
                  className="mb-0.5 size-9 border-primary/15 text-primary/30 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <span className="sr-only">{`Remove site ${idx + 1}`}</span>
                </Button>
              </li>
            ))}
          </ul>

          <Button
            onClick={addSite}
            className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-accent/40 bg-white px-4 py-2.5 text-[12px] font-medium text-accent transition-colors hover:border-accent hover:bg-accent/5"
          >
            <Plus className="size-3.5" aria-hidden />
            Add Study Site
          </Button>
        </fieldset>
      </section>
    </form>
  );
}
