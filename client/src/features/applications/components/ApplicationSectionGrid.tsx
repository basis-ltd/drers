import type { ReactNode } from 'react';
import type { Application } from '@/features/applications/api/types';
import { capitalizeString, formatDate } from '@/utils/strings.utils';

interface Props {
  application: Application;
  staggered?: boolean;
}

export function ApplicationSectionGrid({ application, staggered = false }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Study details" order={0} staggered={staggered}>
        <Grid>
          <Field label="Title" value={application.details?.title} wide />
          <Field
            label="Research area"
            value={capitalizeString(application.details?.area ?? '')}
          />
          <Field label="Funding" value={application.details?.funding} />
          <Field
            label="Study type"
            value={capitalizeString(application.details?.studyType ?? '')}
          />
          <Field
            label="Review pathway"
            value={capitalizeString(application.details?.pathway ?? '')}
          />
          <Field
            label="Start date"
            value={
              application.details?.startDate
                ? formatDate(application.details.startDate, 'DD MMM YYYY')
                : null
            }
          />
          <Field
            label="End date"
            value={
              application.details?.endDate
                ? formatDate(application.details.endDate, 'DD MMM YYYY')
                : null
            }
          />
          <Field
            label="Multi-centre"
            value={application.details?.multiCentre ? 'Yes' : 'No'}
          />
        </Grid>
      </Section>

      <Section title="Research team" order={1} staggered={staggered}>
        <Grid>
          <Field label="Department" value={application.team?.piDepartment} />
          <Field label="Institution" value={application.team?.piInstitution} />
          <Field label="PI phone" value={application.team?.piPhone} />
          <Field label="NHRA registration" value={application.team?.piNhra} />
        </Grid>
        {application.coInvestigators && application.coInvestigators.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[10px] font-medium tracking-wider text-primary/45 uppercase">
              Co-investigators
            </p>
            <ul className="divide-y divide-primary/8 rounded-sm border border-primary/8">
              {application.coInvestigators.map((ci) => (
                <li
                  key={ci.id}
                  className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 text-[12px]"
                >
                  <span className="text-primary">
                    {ci.title ? `${ci.title}. ` : ''}
                    {ci.name}
                  </span>
                  {ci.role && (
                    <span className="text-primary/50">{ci.role}</span>
                  )}
                  {ci.institution && (
                    <span className="text-primary/40">{ci.institution}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Study protocol" order={2} staggered={staggered}>
        <LongField label="Background" value={application.protocol?.background} />
        <LongField
          label="Primary objective"
          value={application.protocol?.primaryObjective}
        />
        <LongField
          label="Secondary objectives"
          value={application.protocol?.secondaryObjectives}
        />
        <Grid>
          <Field
            label="Design"
            value={capitalizeString(application.protocol?.design ?? '')}
          />
          <Field label="Duration" value={application.protocol?.duration} />
          <Field
            label="Sample size"
            value={application.protocol?.sampleSize?.toString() ?? null}
          />
          <Field
            label="Statistical power"
            value={application.protocol?.statPower}
          />
        </Grid>
        <LongField label="Population" value={application.protocol?.population} />
        <LongField
          label="Inclusion criteria"
          value={application.protocol?.inclusionCriteria}
        />
        <LongField
          label="Exclusion criteria"
          value={application.protocol?.exclusionCriteria}
        />
        <LongField
          label="Recruitment"
          value={application.protocol?.recruitment}
        />
        <LongField label="Procedures" value={application.protocol?.procedures} />
      </Section>

      <Section title="Ethical considerations" order={3} staggered={staggered}>
        <LongField label="Risks" value={application.ethics?.risks} />
        <LongField
          label="Risk mitigation"
          value={application.ethics?.riskMitigation}
        />
        <LongField label="Benefits" value={application.ethics?.benefits} />
        {application.ethics?.vulnerablePopulations &&
          application.ethics.vulnerablePopulations.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-[10px] font-medium tracking-wider text-primary/45 uppercase">
                Vulnerable populations
              </p>
              <div className="flex flex-wrap gap-1.5">
                {application.ethics.vulnerablePopulations.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        <LongField
          label="Consent process"
          value={application.ethics?.consentProcess}
        />
        <Grid>
          <Field
            label="Consent waiver"
            value={application.ethics?.consentWaiver}
          />
          <Field
            label="Conflict of interest"
            value={application.ethics?.conflictOfInterest}
          />
        </Grid>
        {application.ethics?.consentWaiverJustification && (
          <LongField
            label="Consent waiver justification"
            value={application.ethics.consentWaiverJustification}
          />
        )}
        <LongField
          label="Data storage"
          value={application.ethics?.dataStorage}
        />
        <LongField
          label="Confidentiality"
          value={application.ethics?.confidentiality}
        />
        {application.ethics?.conflictOfInterestDescription && (
          <LongField
            label="Conflict description"
            value={application.ethics.conflictOfInterestDescription}
          />
        )}
      </Section>

      {application.studySites && application.studySites.length > 0 && (
        <Section title="Study sites" order={4} staggered={staggered}>
          <ul className="divide-y divide-primary/8 rounded-sm border border-primary/8">
            {application.studySites.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 text-[12px]"
              >
                <span className="text-primary">{s.name}</span>
                {s.location && (
                  <span className="text-primary/50">{s.location}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Declaration" order={5} staggered={staggered}>
        <Grid>
          <Field
            label="Agreed"
            value={application.declaration?.agreed ? 'Yes' : 'No'}
          />
          <Field
            label="Signed by"
            value={application.declaration?.signerName}
          />
          <Field
            label="Designation"
            value={application.declaration?.signerDesignation}
          />
          <Field
            label="Signed at"
            value={
              application.declaration?.signedAt
                ? formatDate(application.declaration.signedAt, 'DD MMM YYYY HH:mm')
                : null
            }
          />
        </Grid>
        {application.declaration?.declarationText && (
          <LongField
            label="Declaration text"
            value={application.declaration.declarationText}
          />
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  order,
  staggered,
}: {
  title: string;
  children: ReactNode;
  order: number;
  staggered: boolean;
}) {
  return (
    <section
      className={`rounded-md border border-primary/10 bg-stone-50/65 p-5 md:p-6 ${
        staggered ? 'animate-[sectionReveal_420ms_ease-out_both]' : ''
      }`}
      style={staggered ? { animationDelay: `${order * 80}ms` } : undefined}
    >
      <h2 className="mb-4 font-heading text-[18px] leading-tight text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>;
}

function Field({
  label,
  value,
  wide,
}: {
  label: string;
  value: string | null | undefined;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-[10px] font-medium tracking-wider text-primary/45 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[12.5px] text-primary">
        {value && value.length > 0 ? (
          value
        ) : (
          <span className="text-primary/25">Not provided</span>
        )}
      </dd>
    </div>
  );
}

function LongField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1 text-[10px] font-medium tracking-wider text-primary/45 uppercase">
        {label}
      </p>
      {value ? (
        <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-primary">
          {value}
        </p>
      ) : (
        <p className="text-[12.5px] text-primary/25">Not provided</p>
      )}
    </div>
  );
}
