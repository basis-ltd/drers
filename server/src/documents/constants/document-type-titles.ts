import { DocumentType } from '../enums/document-type.enum';

export interface DocumentTypeMeta {
  title: string;
  description: string;
  ocrPurpose: string;
  requiredSections: string[];
  optionalSections: string[];
  requiredSignals: string[];
  documentSpecificInstructions: string;
}

function createMeta(meta: DocumentTypeMeta): DocumentTypeMeta {
  return meta;
}

export const DOCUMENT_TYPE_TITLES: Record<DocumentType, DocumentTypeMeta> = {
  [DocumentType.PROTOCOL]: createMeta({
    title: 'Study Protocol',
    description:
      'Full research protocol describing objectives, methodology, participants, and procedures.',
    ocrPurpose:
      'Confirm this is a full study protocol and verify that the core scientific, operational, and ethics sections are present across the whole document.',
    requiredSections: [
      'Study title and identifiers',
      'Protocol or study number',
      'Version and date',
      'Sponsor and funder',
      'Informational contacts',
      'List of abbreviations',
      'Study synopsis',
      'Protocol amendments',
      'Background',
      'Rationale',
      'Aims and objectives',
      'Methods',
      'Study population',
      'Inclusion criteria',
      'Exclusion criteria',
      'Intervention',
      'Data sources',
      'Study procedures',
      'Outcome measures',
      'Sample size',
      'Data management',
      'Quality assurance and monitoring',
      'Analysis strategy',
      'Data reporting',
      'Safety reporting',
      'Ethical considerations',
      'Logistics',
      'References',
    ],
    optionalSections: [
      'Sub-study modules',
      'Appendices',
      'Laboratory SOPs',
      'Participant information sheets',
      'Questionnaires',
    ],
    requiredSignals: [
      'Study title',
      'Protocol number',
      'Version number',
      'Protocol date',
      'Sponsor name',
      'Funder name',
      'Main objectives',
      'Eligibility criteria',
      'Sample size statement',
      'Analysis plan',
      'Ethics approval language',
      'Safety reporting language',
    ],
    documentSpecificInstructions:
      'Treat sub-studies, appendices, questionnaires, and laboratory SOPs as optional unless the protocol explicitly says they are mandatory components. Mark a required section as found only when the document clearly evidences it by heading or unmistakable content.',
  }),
  [DocumentType.INFORMED_CONSENT_FORM]: createMeta({
    title: 'Informed Consent Form',
    description:
      'Participant-facing consent document outlining risks, benefits, voluntariness, and confidentiality.',
    ocrPurpose:
      'Confirm the document is a participant consent form and validate that the participant-facing ethical disclosures and signature blocks are present.',
    requiredSections: [
      'Study identification',
      'Purpose of the study',
      'Participant procedures',
      'Duration or time commitment',
      'Risks or discomforts',
      'Benefits',
      'Confidentiality and privacy',
      'Voluntary participation and withdrawal',
      'Contact information',
      'Consent statements',
      'Participant signature and date block',
    ],
    optionalSections: [
      'Witness signature block',
      'Translator statement',
      'Researcher or person obtaining consent signature block',
      'Compensation statement',
      'Alternative procedures',
    ],
    requiredSignals: [
      'Study title',
      'Participant name field',
      'Signature field',
      'Date field',
      'Contact details',
      'Confidentiality language',
      'Voluntary participation language',
      'Risk disclosure',
      'Benefit disclosure',
    ],
    documentSpecificInstructions:
      'Focus on participant-facing wording. If the document is informational but lacks an actual consent declaration or signature area, flag that explicitly.',
  }),
  [DocumentType.PRINCIPAL_INVESTIGATOR_CV]: createMeta({
    title: 'Principal Investigator CV / Resume',
    description:
      'Curriculum vitae or resume of the principal investigator with qualifications and prior research.',
    ocrPurpose:
      'Confirm the file is a CV or resume for the principal investigator and that it evidences qualifications, appointments, and research background.',
    requiredSections: [
      'Investigator identity',
      'Professional title or role',
      'Qualifications and education',
      'Employment or appointments history',
      'Research experience',
    ],
    optionalSections: [
      'Publications',
      'Professional memberships',
      'Certifications',
      'Training history',
      'Awards',
      'Referees or references',
    ],
    requiredSignals: [
      'Full name',
      'Current role',
      'Institution or employer',
      'Academic qualification',
      'Research experience evidence',
      'Recent activity dates',
    ],
    documentSpecificInstructions:
      'Do not require a rigid section order. Treat a resume, biosketch, or academic CV as valid if it clearly identifies the investigator and their qualifications.',
  }),
  [DocumentType.ETHICS_TRAINING_CERT]: createMeta({
    title: 'Research Ethics Training Certificate',
    description:
      'Certificate evidencing completion of recognized research ethics training (e.g. CITI, GCP).',
    ocrPurpose:
      'Confirm the certificate belongs to the researcher and captures the provider, course, completion details, and any validity period.',
    requiredSections: [
      'Certificate holder identity',
      'Issuing organization',
      'Course or training title',
      'Completion date',
    ],
    optionalSections: [
      'Certificate number',
      'Expiry date',
      'Continuing education credits',
      'Score or grade',
      'Delivery mode',
    ],
    requiredSignals: [
      'Participant name',
      'Issuer name',
      'Training title',
      'Completion statement',
      'Completion date',
    ],
    documentSpecificInstructions:
      'Accept recognized ethics or GCP training certificates. Flag the document if it looks like a general attendance slip or unrelated training record.',
  }),
  [DocumentType.NHRA_RESEARCHER_CERT]: createMeta({
    title: 'NHRA Researcher Certification',
    description:
      'National Health Research Agency researcher accreditation certificate.',
    ocrPurpose:
      'Confirm the document is an NHRA researcher accreditation or certification and capture identity, issuing authority, certificate reference, and validity cues.',
    requiredSections: [
      'Researcher identity',
      'Issuing authority',
      'Certificate or accreditation statement',
      'Issue date',
    ],
    optionalSections: [
      'Certificate number',
      'Expiry date',
      'Registration status',
      'Authorized scope',
    ],
    requiredSignals: [
      'Researcher name',
      'NHRA or issuing authority name',
      'Certification statement',
      'Issue date',
    ],
    documentSpecificInstructions:
      'Flag missing validity details when the certificate appears time-bound, but do not invent an expiry date if none is shown.',
  }),
  [DocumentType.COVER_LETTER]: createMeta({
    title: 'Cover Letter',
    description:
      'Formal cover letter addressed to the ethics committee introducing the submission.',
    ocrPurpose:
      'Confirm this is a submission cover letter and verify the addressee, purpose, study linkage, and signature details.',
    requiredSections: [
      'Addressee',
      'Submission purpose',
      'Study identification',
      'Applicant or principal investigator identity',
      'Closing and signature',
      'Date',
    ],
    optionalSections: [
      'Enclosures list',
      'Institutional letterhead',
      'Contact details',
      'Reference number',
    ],
    requiredSignals: [
      'Committee addressee',
      'Study title or identifier',
      'Applicant name',
      'Signature block',
      'Letter date',
    ],
    documentSpecificInstructions:
      'A short transmittal letter is acceptable if it clearly introduces the ethics submission. Distinguish it from a protocol cover page or memo.',
  }),
  [DocumentType.BUDGET]: createMeta({
    title: 'Study Budget',
    description:
      'Itemized budget for the research study including funding sources and costs.',
    ocrPurpose:
      'Confirm the document is a study budget and validate that it contains traceable cost lines, totals, and study linkage.',
    requiredSections: [
      'Study identification',
      'Budget line items or categories',
      'Amounts or costs',
      'Totals or subtotals',
      'Currency',
    ],
    optionalSections: [
      'Funding source',
      'Budget justification',
      'Timeline or budget period',
      'Personnel costs',
      'Operational costs',
      'Equipment or supplies',
    ],
    requiredSignals: [
      'Study title or identifier',
      'Currency notation',
      'Line item descriptions',
      'Numeric amounts',
      'Total amount',
    ],
    documentSpecificInstructions:
      'Flag the file if it looks like a narrative funding letter, invoice, or procurement quote instead of a study budget.',
  }),
  [DocumentType.OTHER]: createMeta({
    title: 'Supporting Document',
    description:
      'Any additional supporting document relevant to the submission.',
    ocrPurpose:
      'Classify the supporting document, capture its key identifiers and signatures, and explain whether it plausibly supports the application.',
    requiredSections: [
      'Document identity or purpose',
      'Key identifiers or reference details',
    ],
    optionalSections: [
      'Date',
      'Signature or approval block',
      'Institution or issuer details',
      'Supporting narrative',
    ],
    requiredSignals: [
      'Document title',
      'Reference number',
      'Date',
      'Named organization',
      'Signature indicator',
    ],
    documentSpecificInstructions:
      'Use a flexible review. If the document does not fit a known ethics-submission artifact, state that clearly and explain the mismatch in review notes.',
  }),
};
