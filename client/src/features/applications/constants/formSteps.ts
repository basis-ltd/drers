export const STEPS = [
  { id: 1, label: 'Application\nDetails',    short: 'Details'  },
  { id: 2, label: 'Research\nTeam',          short: 'Team'     },
  { id: 3, label: 'Study\nProtocol',         short: 'Protocol' },
  { id: 4, label: 'Ethical\nConsiderations', short: 'Ethics'   },
  { id: 5, label: 'Documents',               short: 'Docs'     },
  { id: 6, label: 'Declaration\n& Submit',   short: 'Submit'   },
] as const;

export const RESEARCH_AREAS = [
  { value: 'CLINICAL_TRIAL',       label: 'Clinical Trial'         },
  { value: 'PUBLIC_HEALTH',        label: 'Public Health'          },
  { value: 'EPIDEMIOLOGY',         label: 'Epidemiology'           },
  { value: 'SOCIAL_SCIENCES',      label: 'Social Sciences'        },
  { value: 'BASIC_SCIENCE',        label: 'Basic Science'          },
  { value: 'COMMUNITY_HEALTH',     label: 'Community Health'       },
  { value: 'NURSING_AND_MIDWIFERY',label: 'Nursing & Midwifery'    },
  { value: 'MENTAL_HEALTH',        label: 'Mental Health'          },
  { value: 'ENVIRONMENTAL_HEALTH', label: 'Environmental Health'   },
  { value: 'OTHER',                label: 'Other'                  },
];

export const STUDY_TYPES = [
  { value: 'INTERVENTIONAL', label: 'Interventional Study',  hint: 'Trials involving an intervention or treatment' },
  { value: 'OBSERVATIONAL',  label: 'Observational Study',   hint: 'No intervention; participants observed in their natural setting' },
  { value: 'QUALITATIVE',    label: 'Qualitative Study',     hint: 'Interviews, focus groups, ethnographic methods' },
  { value: 'MIXED',          label: 'Mixed Methods',         hint: 'Combination of quantitative and qualitative approaches' },
];

export const REVIEW_PATHWAYS = [
  { value: 'FULL',      label: 'Full Committee Review', hint: 'Required for studies involving more than minimal risk. Reviewed at full board meeting.' },
  { value: 'EXPEDITED', label: 'Expedited Review',      hint: 'For studies involving minimal risk. Reviewed by a subcommittee. Faster turnaround.' },
  { value: 'EXEMPT',    label: 'Exempt Review',         hint: 'For research involving no risk to participants (e.g. anonymous surveys, secondary data).' },
];

export const MULTI_CENTRE_OPTIONS = [
  { value: 'false', label: 'No — Single site'        },
  { value: 'true',  label: 'Yes — Multiple sites'    },
];

export const STUDY_DESIGNS = [
  { value: 'RCT',                          label: 'Randomized Controlled Trial (RCT)'       },
  { value: 'NON_RANDOMIZED_CONTROLLED_TRIAL', label: 'Non-randomized Controlled Trial'      },
  { value: 'COHORT_PROSPECTIVE',           label: 'Cohort Study (Prospective)'              },
  { value: 'COHORT_RETROSPECTIVE',         label: 'Cohort Study (Retrospective)'            },
  { value: 'CASE_CONTROL',                 label: 'Case-Control Study'                      },
  { value: 'CROSS_SECTIONAL',              label: 'Cross-sectional Study'                   },
  { value: 'CASE_SERIES',                  label: 'Case Series / Case Report'               },
  { value: 'QUALITATIVE_STUDY',            label: 'Qualitative Study'                       },
  { value: 'SYSTEMATIC_REVIEW',            label: 'Systematic Review / Meta-analysis'       },
  { value: 'MIXED_METHODS',               label: 'Mixed Methods'                            },
  { value: 'OTHER',                        label: 'Other'                                   },
];

export const PROFESSIONAL_TITLES = [
  { value: 'DR',   label: 'Dr.'   },
  { value: 'PROF', label: 'Prof.' },
  { value: 'MR',   label: 'Mr.'   },
  { value: 'MRS',  label: 'Mrs.'  },
  { value: 'MS',   label: 'Ms.'   },
  { value: 'REV',  label: 'Rev.'  },
];

export const VULNERABLE_POPULATIONS = [
  'Children / Minors (< 18 years)',
  'Pregnant or Breastfeeding Women',
  'Elderly (≥ 65 years)',
  'Prisoners or Detainees',
  'Persons with Mental Illness',
  'Economically Disadvantaged Groups',
  'None — No vulnerable populations',
];

export const CONSENT_WAIVER_OPTIONS = [
  { value: 'NO',  label: 'No — Standard informed consent will be obtained'              },
  { value: 'YES', label: 'Yes — Requesting a waiver or modification of informed consent' },
];

export const CONFLICT_OF_INTEREST_OPTIONS = [
  { value: 'NONE', label: 'No conflict of interest to declare'    },
  { value: 'YES',  label: 'I have a conflict of interest to disclose' },
];

export const REVIEW_FEES: Record<string, string> = {
  FULL:      'RWF 150,000',
  EXPEDITED: 'RWF 75,000',
  EXEMPT:    'RWF 0',
};

export const REVIEW_PATHWAY_LABELS: Record<string, string> = {
  FULL:      'Full Committee Review',
  EXPEDITED: 'Expedited Review',
  EXEMPT:    'Exempt Review',
};

export const DOC_TYPES = [
  { key: 'protocol',     label: 'Research Protocol',           required: true,  formats: 'PDF, DOCX',        maxMB: 50 },
  { key: 'consent',      label: 'Informed Consent Form(s)',    required: true,  formats: 'PDF, DOCX',        maxMB: 20 },
  { key: 'cv',           label: 'Principal Investigator CV',   required: true,  formats: 'PDF',              maxMB: 10 },
  { key: 'ethics_cert',  label: 'Ethics Training Certificate', required: true,  formats: 'PDF, JPG, PNG',    maxMB: 10 },
  { key: 'nhra_cert',    label: 'NHRA Researcher Certificate', required: true,  formats: 'PDF, JPG, PNG',    maxMB: 10 },
  { key: 'cover_letter', label: 'Cover Letter',                required: false, formats: 'PDF, DOCX',        maxMB: 10 },
  { key: 'budget',       label: 'Budget / Funding Document',   required: false, formats: 'PDF, DOCX, XLSX',  maxMB: 10 },
  { key: 'other',        label: 'Other Supporting Documents',  required: false, formats: 'Any format',       maxMB: 10 },
];
