// ── Enums ────────────────────────────────────────────────────────────────────

export type ApplicationType =
  | 'NEW'
  | 'AMENDMENT'
  | 'RENEWAL'
  | 'PROGRESS_REPORT'
  | 'AE_REPORT'
  | 'SAE_REPORT'
  | 'PROTOCOL_DEVIATION'
  | 'CLOSURE';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PAYMENT_PENDING'
  | 'SCREENING'
  | 'UNDER_REVIEW'
  | 'QUERY_RAISED'
  | 'RESUBMITTED'
  | 'MEETING_SCHEDULED'
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REVISIONS_REQUIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED';

export type ApplicationListScope = 'MY' | 'REVIEW';

export type ReviewPathway = 'FULL' | 'EXPEDITED' | 'EXEMPT';

export type StudyType = 'INTERVENTIONAL' | 'OBSERVATIONAL' | 'QUALITATIVE' | 'MIXED';

export type ResearchArea =
  | 'CLINICAL_TRIAL'
  | 'PUBLIC_HEALTH'
  | 'EPIDEMIOLOGY'
  | 'SOCIAL_SCIENCES'
  | 'BASIC_SCIENCE'
  | 'COMMUNITY_HEALTH'
  | 'NURSING_AND_MIDWIFERY'
  | 'MENTAL_HEALTH'
  | 'ENVIRONMENTAL_HEALTH'
  | 'OTHER';

export type StudyDesign =
  | 'RCT'
  | 'NON_RANDOMIZED_CONTROLLED_TRIAL'
  | 'COHORT_PROSPECTIVE'
  | 'COHORT_RETROSPECTIVE'
  | 'CASE_CONTROL'
  | 'CROSS_SECTIONAL'
  | 'CASE_SERIES'
  | 'QUALITATIVE_STUDY'
  | 'SYSTEMATIC_REVIEW'
  | 'MIXED_METHODS'
  | 'OTHER';

export type ConsentWaiver = 'YES' | 'NO';
export type ConflictOfInterest = 'NONE' | 'YES';
export type ProfessionalTitle = 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF' | 'REV';
export type DocumentType =
  | 'PROTOCOL'
  | 'INFORMED_CONSENT_FORM'
  | 'PRINCIPAL_INVESTIGATOR_CV'
  | 'ETHICS_TRAINING_CERT'
  | 'NHRA_RESEARCHER_CERT'
  | 'COVER_LETTER'
  | 'BUDGET'
  | 'OTHER';
export type DocumentOcrStatus = 'PENDING' | 'PROCESSING' | 'EXTRACTED' | 'FAILED';

// ── Entity shapes (returned from API) ────────────────────────────────────────

export interface ApplicationDetails {
  id: string;
  applicationId: string;
  title: string | null;
  area: ResearchArea | null;
  funding: string | null;
  studyType: StudyType | null;
  pathway: ReviewPathway | null;
  startDate: string | null;
  endDate: string | null;
  multiCentre: boolean;
}

export interface CoInvestigator {
  id: string;
  applicationId: string;
  title: ProfessionalTitle | null;
  name: string;
  institution: string | null;
  role: string | null;
  sortOrder: number;
}

export interface StudySite {
  id: string;
  applicationId: string;
  name: string;
  location: string | null;
  sortOrder: number;
}

export interface ApplicationTeam {
  id: string;
  applicationId: string;
  piDepartment: string | null;
  piInstitution: string | null;
  piPhone: string | null;
  piNhra: string | null;
}

export interface ApplicationProtocol {
  id: string;
  applicationId: string;
  background: string | null;
  primaryObjective: string | null;
  secondaryObjectives: string | null;
  design: StudyDesign | null;
  duration: string | null;
  sampleSize: number | null;
  statPower: string | null;
  population: string | null;
  inclusionCriteria: string | null;
  exclusionCriteria: string | null;
  recruitment: string | null;
  procedures: string | null;
}

export interface ApplicationEthics {
  id: string;
  applicationId: string;
  risks: string | null;
  riskMitigation: string | null;
  benefits: string | null;
  vulnerablePopulations: string[] | null;
  consentProcess: string | null;
  consentWaiver: ConsentWaiver | null;
  consentWaiverJustification: string | null;
  dataStorage: string | null;
  confidentiality: string | null;
  conflictOfInterest: ConflictOfInterest | null;
  conflictOfInterestDescription: string | null;
}

export interface ApplicationDeclaration {
  id: string;
  applicationId: string;
  declarationText: string | null;
  agreed: boolean;
  signerName: string | null;
  signerDesignation: string | null;
  signatureCloudinaryUrl: string | null;
  signatureData: string | null;
  signedAt: string | null;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  originalFilename: string;
  mimeType: string | null;
  cloudinaryPublicId: string | null;
  cloudinaryUrl: string | null;
  secureUrl: string | null;
  cloudinaryResourceType: string | null;
  format: string;
  pageCount: number | null;
  detectedLanguages: string[] | null;
  hasTextLayer: boolean | null;
  scanQualityScore: number | null;
  fileSizeBytes: number;
  checksum: string | null;
  isRequired: boolean;
  isCurrentVersion: boolean;
  ocrStatus: DocumentOcrStatus;
  ocrProvider: string | null;
  ocrModel: string | null;
  ocrStartedAt: string | null;
  ocrCompletedAt: string | null;
  ocrErrorMessage: string | null;
  ocrConfidence: number | null;
  ocrExtractedText: string | null;
  ocrExtractedData: Record<string, unknown> | null;
  ocrContext: Record<string, unknown> | null;
  aiScreeningResult: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  referenceNumber: string;
  applicantId: string;
  tenantId: string;
  type: ApplicationType;
  status: ApplicationStatus;
  versionNumber: number;
  submittedAt: string | null;
  decisionAt: string | null;
  parentApplicationId: string | null;
  createdAt: string;
  updatedAt: string;
  details: ApplicationDetails | null;
  team: ApplicationTeam | null;
  protocol: ApplicationProtocol | null;
  ethics: ApplicationEthics | null;
  declaration: ApplicationDeclaration | null;
  coInvestigators?: CoInvestigator[];
  studySites?: StudySite[];
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateApplicationDto {
  type: ApplicationType;
  parentApplicationId?: string;
}

export interface UpdateApplicationDetailsDto {
  title?: string;
  area?: ResearchArea;
  funding?: string;
  studyType?: StudyType;
  pathway?: ReviewPathway;
  startDate?: string;
  endDate?: string;
  multiCentre?: boolean;
}

export interface CoInvestigatorItemDto {
  title?: ProfessionalTitle;
  name: string;
  institution?: string;
  role?: string;
}

export interface StudySiteItemDto {
  name: string;
  location?: string;
}

export interface UpdateApplicationTeamDto {
  piDepartment?: string;
  piInstitution?: string;
  piPhone?: string;
  piNhra?: string;
  coInvestigators?: CoInvestigatorItemDto[];
  studySites?: StudySiteItemDto[];
}

export interface UpdateApplicationProtocolDto {
  background?: string;
  primaryObjective?: string;
  secondaryObjectives?: string;
  design?: StudyDesign;
  duration?: string;
  sampleSize?: number;
  statPower?: string;
  population?: string;
  inclusionCriteria?: string;
  exclusionCriteria?: string;
  recruitment?: string;
  procedures?: string;
}

export interface UpdateApplicationEthicsDto {
  risks?: string;
  riskMitigation?: string;
  benefits?: string;
  vulnerablePopulations?: string[];
  consentProcess?: string;
  consentWaiver?: ConsentWaiver;
  consentWaiverJustification?: string;
  dataStorage?: string;
  confidentiality?: string;
  conflictOfInterest?: ConflictOfInterest;
  conflictOfInterestDescription?: string;
}

export interface UpdateApplicationDeclarationDto {
  declarationText?: string;
  agreed?: boolean;
  signerName?: string;
  signerDesignation?: string;
  signatureCloudinaryUrl?: string;
  signatureData?: string;
}

export interface ListApplicationsQuery {
  scope?: ApplicationListScope;
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[];
  type?: ApplicationType;
  page?: number;
  limit?: number;
}

export interface ListApplicationsResponse {
  data: Application[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateApplicationResponse {
  id: string;
  referenceNumber: string;
}
