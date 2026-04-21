import { DocumentType } from '../enums/document-type.enum';

export interface DocumentTypeMeta {
  title: string;
  description: string;
}

export const DOCUMENT_TYPE_TITLES: Record<DocumentType, DocumentTypeMeta> = {
  [DocumentType.PROTOCOL]: {
    title: 'Study Protocol',
    description:
      'Full research protocol describing objectives, methodology, participants, and procedures.',
  },
  [DocumentType.INFORMED_CONSENT_FORM]: {
    title: 'Informed Consent Form',
    description:
      'Participant-facing consent document outlining risks, benefits, voluntariness, and confidentiality.',
  },
  [DocumentType.PRINCIPAL_INVESTIGATOR_CV]: {
    title: 'Principal Investigator CV / Resume',
    description:
      'Curriculum vitae or resume of the principal investigator with qualifications and prior research.',
  },
  [DocumentType.ETHICS_TRAINING_CERT]: {
    title: 'Research Ethics Training Certificate',
    description:
      'Certificate evidencing completion of recognized research ethics training (e.g. CITI, GCP).',
  },
  [DocumentType.NHRA_RESEARCHER_CERT]: {
    title: 'NHRA Researcher Certification',
    description:
      'National Health Research Agency researcher accreditation certificate.',
  },
  [DocumentType.COVER_LETTER]: {
    title: 'Cover Letter',
    description:
      'Formal cover letter addressed to the ethics committee introducing the submission.',
  },
  [DocumentType.BUDGET]: {
    title: 'Study Budget',
    description:
      'Itemized budget for the research study including funding sources and costs.',
  },
  [DocumentType.OTHER]: {
    title: 'Supporting Document',
    description: 'Any additional supporting document relevant to the submission.',
  },
};
