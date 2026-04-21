import type { DocumentType } from '@/features/applications/api/types';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PROTOCOL: 'Study Protocol',
  INFORMED_CONSENT_FORM: 'Informed Consent Form',
  PRINCIPAL_INVESTIGATOR_CV: 'Principal Investigator CV',
  ETHICS_TRAINING_CERT: 'Ethics Training Certificate',
  NHRA_RESEARCHER_CERT: 'NHRA Researcher Certificate',
  COVER_LETTER: 'Cover Letter',
  BUDGET: 'Budget',
  OTHER: 'Other',
};
