import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CircleCheckBig,
  CreditCard,
  FileSearch,
  Landmark,
  MessageSquareMore,
  Settings2,
  Users,
  ClipboardList,
} from "lucide-react";
import type { TenantRoleAssignment } from "@/features/auth/model/types";
import type {
  ApplicationStatus,
  ApplicationType,
  ResearchArea,
  ReviewPathway,
} from "@/features/applications/api/types";
import { STATUS_STYLES } from "@/features/applications/utils/statusStyles";

export type RoleName =
  | "APPLICANT"
  | "REVIEWER"
  | "IRB_ADMIN"
  | "RNEC_ADMIN"
  | "FINANCE"
  | "CHAIRPERSON"
  | "SYS_ADMIN";

export type MetricTone = "default" | "indigo" | "orange" | "green" | "violet";

export type DashboardApplication = {
  id: string;
  referenceNumber: string;
  type: ApplicationType;
  status: ApplicationStatus;
  submittedAt: string | null;
  decisionAt: string | null;
  updatedAt: string;
  details: {
    title: string;
    area: ResearchArea;
    pathway: ReviewPathway;
  };
};

export type VariantMetric = {
  label: string;
  value: number;
  helper: string;
  tone?: MetricTone;
  icon: LucideIcon;
};

export type VariantHighlight = {
  label: string;
  value: string | number;
};

export type VariantTrendSeries = {
  label: string;
  values: number[];
  tone?: MetricTone;
};

export type VariantTrend = {
  title: string;
  rangeLabel: string;
  periods: string[];
  series: VariantTrendSeries[];
};

export type RoleVariant = {
  role: RoleName | "FALLBACK";
  roleLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  secondaryAction: string;
  primaryAction: string;
  metrics: VariantMetric[];
  records: DashboardApplication[];
  trend: VariantTrend;
  tableTitle: string;
  tableHint: string;
  distributionTitle: string;
  distributionActionLabel: string;
  highlightsTitle: string;
  highlights: VariantHighlight[];
  footerNote: string;
};

const ROLE_NAME_SET = new Set<RoleName>([
  "APPLICANT",
  "REVIEWER",
  "IRB_ADMIN",
  "RNEC_ADMIN",
  "FINANCE",
  "CHAIRPERSON",
  "SYS_ADMIN",
]);

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> =
  STATUS_STYLES;

const IN_REVIEW_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "PAYMENT_PENDING",
  "SCREENING",
  "UNDER_REVIEW",
  "QUERY_RAISED",
  "RESUBMITTED",
  "MEETING_SCHEDULED",
  "REVISIONS_REQUIRED",
];

const DECISION_STATUSES: ApplicationStatus[] = [
  "APPROVED",
  "CONDITIONALLY_APPROVED",
  "REJECTED",
  "WITHDRAWN",
  "CLOSED",
];

const SIMULATION_RECORDS: DashboardApplication[] = [
  {
    id: "app-001",
    referenceNumber: "RNEC/2026/APP/001110",
    type: "NEW",
    status: "UNDER_REVIEW",
    submittedAt: "2026-03-12T08:16:00Z",
    decisionAt: null,
    updatedAt: "2026-04-18T10:40:00Z",
    details: {
      title: "Genomic Surveillance of Drug-Resistant Malaria in Eastern Province",
      area: "EPIDEMIOLOGY",
      pathway: "FULL",
    },
  },
  {
    id: "app-002",
    referenceNumber: "RNEC/2026/APP/001124",
    type: "RENEWAL",
    status: "QUERY_RAISED",
    submittedAt: "2026-03-01T09:04:00Z",
    decisionAt: null,
    updatedAt: "2026-04-17T14:12:00Z",
    details: {
      title: "Rural Immunization Follow-up Cohort",
      area: "PUBLIC_HEALTH",
      pathway: "EXPEDITED",
    },
  },
  {
    id: "app-003",
    referenceNumber: "RNEC/2026/APP/001087",
    type: "AMENDMENT",
    status: "SCREENING",
    submittedAt: "2026-02-27T13:32:00Z",
    decisionAt: null,
    updatedAt: "2026-04-16T08:28:00Z",
    details: {
      title: "Postpartum Mental Health Intervention Protocol Revision",
      area: "MENTAL_HEALTH",
      pathway: "FULL",
    },
  },
  {
    id: "app-004",
    referenceNumber: "RNEC/2026/APP/001071",
    type: "NEW",
    status: "MEETING_SCHEDULED",
    submittedAt: "2026-02-16T11:10:00Z",
    decisionAt: null,
    updatedAt: "2026-04-15T07:55:00Z",
    details: {
      title: "Community Maternal Nutrition Trial in peri-urban Kigali",
      area: "COMMUNITY_HEALTH",
      pathway: "FULL",
    },
  },
  {
    id: "app-005",
    referenceNumber: "RNEC/2026/APP/001011",
    type: "NEW",
    status: "APPROVED",
    submittedAt: "2026-01-22T10:48:00Z",
    decisionAt: "2026-03-28T09:41:00Z",
    updatedAt: "2026-03-28T09:41:00Z",
    details: {
      title: "Neonatal Care Pathway Evaluation Across District Hospitals",
      area: "NURSING_AND_MIDWIFERY",
      pathway: "EXPEDITED",
    },
  },
  {
    id: "app-006",
    referenceNumber: "RNEC/2026/APP/000995",
    type: "NEW",
    status: "CONDITIONALLY_APPROVED",
    submittedAt: "2026-01-18T07:14:00Z",
    decisionAt: "2026-03-18T15:02:00Z",
    updatedAt: "2026-03-18T15:02:00Z",
    details: {
      title: "Tuberculosis Contact Tracing Protocol in Mining Communities",
      area: "CLINICAL_TRIAL",
      pathway: "FULL",
    },
  },
  {
    id: "app-007",
    referenceNumber: "RNEC/2026/APP/000973",
    type: "PROGRESS_REPORT",
    status: "REVISIONS_REQUIRED",
    submittedAt: "2026-01-05T10:30:00Z",
    decisionAt: null,
    updatedAt: "2026-03-14T11:18:00Z",
    details: {
      title: "HIV Adherence Counseling Program Midline Findings",
      area: "PUBLIC_HEALTH",
      pathway: "EXPEDITED",
    },
  },
  {
    id: "app-008",
    referenceNumber: "RNEC/2026/APP/000959",
    type: "NEW",
    status: "REJECTED",
    submittedAt: "2026-01-03T12:02:00Z",
    decisionAt: "2026-03-10T16:22:00Z",
    updatedAt: "2026-03-10T16:22:00Z",
    details: {
      title: "Behavioral Study on Informal Pharmacy Antibiotic Practices",
      area: "SOCIAL_SCIENCES",
      pathway: "FULL",
    },
  },
  {
    id: "app-009",
    referenceNumber: "RNEC/2026/APP/000931",
    type: "CLOSURE",
    status: "CLOSED",
    submittedAt: "2025-12-20T09:20:00Z",
    decisionAt: "2026-02-28T10:00:00Z",
    updatedAt: "2026-02-28T10:00:00Z",
    details: {
      title: "Longitudinal Study of Occupational Respiratory Illness",
      area: "ENVIRONMENTAL_HEALTH",
      pathway: "EXEMPT",
    },
  },
  {
    id: "app-010",
    referenceNumber: "RNEC/2026/APP/001136",
    type: "SAE_REPORT",
    status: "SUBMITTED",
    submittedAt: "2026-04-07T15:05:00Z",
    decisionAt: null,
    updatedAt: "2026-04-19T12:25:00Z",
    details: {
      title: "Serious Adverse Event Follow-up: Multi-site ARV Trial",
      area: "CLINICAL_TRIAL",
      pathway: "FULL",
    },
  },
  {
    id: "app-011",
    referenceNumber: "RNEC/2026/APP/001142",
    type: "NEW",
    status: "DRAFT",
    submittedAt: null,
    decisionAt: null,
    updatedAt: "2026-04-20T08:11:00Z",
    details: {
      title: "Pediatric Asthma Medication Adherence Assessment",
      area: "CLINICAL_TRIAL",
      pathway: "EXPEDITED",
    },
  },
  {
    id: "app-012",
    referenceNumber: "RNEC/2026/APP/001145",
    type: "AE_REPORT",
    status: "PAYMENT_PENDING",
    submittedAt: "2026-04-16T11:02:00Z",
    decisionAt: null,
    updatedAt: "2026-04-20T13:44:00Z",
    details: {
      title: "Adverse Event Notification: District Vaccine Study",
      area: "PUBLIC_HEALTH",
      pathway: "FULL",
    },
  },
];

const ROLE_RECORD_IDS: Record<RoleName, string[]> = {
  APPLICANT: ["app-011", "app-001", "app-002", "app-005", "app-010"],
  REVIEWER: ["app-001", "app-002", "app-003", "app-007", "app-010", "app-012"],
  IRB_ADMIN: ["app-003", "app-004", "app-001", "app-002", "app-007", "app-005"],
  RNEC_ADMIN: ["app-001", "app-002", "app-003", "app-004", "app-005", "app-006", "app-008", "app-010"],
  FINANCE: ["app-012", "app-010", "app-002", "app-001", "app-005", "app-009"],
  CHAIRPERSON: ["app-004", "app-001", "app-003", "app-006", "app-008", "app-005"],
  SYS_ADMIN: ["app-001", "app-002", "app-003", "app-004", "app-005", "app-010", "app-011", "app-012"],
};

const TREND_PERIODS = [
  "Wk 1",
  "Wk 2",
  "Wk 3",
  "Wk 4",
  "Wk 5",
  "Wk 6",
  "Wk 7",
  "Wk 8",
  "Wk 9",
  "Wk 10",
  "Wk 11",
  "Wk 12",
];

const ROLE_TRENDS: Record<RoleName | "FALLBACK", VariantTrend> = {
  APPLICANT: {
    title: "Application Progress",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [1, 1, 2, 2, 2, 3, 3, 2, 3, 3, 4, 4], tone: "default" },
      { label: "Under Review", values: [0, 1, 1, 1, 2, 2, 1, 2, 2, 2, 2, 3], tone: "indigo" },
      { label: "Decisions", values: [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2], tone: "green" },
    ],
  },
  REVIEWER: {
    title: "Application Trend",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [3, 4, 5, 5, 7, 6, 7, 6, 7, 8, 8, 9], tone: "default" },
      { label: "Under Review", values: [2, 3, 3, 4, 4, 5, 5, 4, 5, 5, 6, 6], tone: "indigo" },
      { label: "Decisions", values: [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4], tone: "green" },
    ],
  },
  IRB_ADMIN: {
    title: "Board Throughput",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [4, 5, 5, 6, 7, 7, 8, 8, 9, 9, 10, 10], tone: "default" },
      { label: "Under Review", values: [3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7], tone: "indigo" },
      { label: "Decisions", values: [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5], tone: "green" },
    ],
  },
  RNEC_ADMIN: {
    title: "National Review Trend",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [5, 6, 7, 7, 8, 9, 8, 9, 10, 10, 11, 12], tone: "default" },
      { label: "Under Review", values: [3, 4, 4, 5, 5, 6, 6, 5, 6, 6, 7, 7], tone: "indigo" },
      { label: "Decisions", values: [1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6], tone: "green" },
    ],
  },
  FINANCE: {
    title: "Payment Operations",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [2, 3, 3, 4, 4, 5, 4, 5, 5, 6, 6, 6], tone: "default" },
      { label: "Under Review", values: [1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4], tone: "indigo" },
      { label: "Decisions", values: [0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3], tone: "green" },
    ],
  },
  CHAIRPERSON: {
    title: "Committee Cadence",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8], tone: "default" },
      { label: "Under Review", values: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6], tone: "indigo" },
      { label: "Decisions", values: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4], tone: "green" },
    ],
  },
  SYS_ADMIN: {
    title: "Platform Operations Trend",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9], tone: "default" },
      { label: "Under Review", values: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6], tone: "indigo" },
      { label: "Decisions", values: [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4], tone: "green" },
    ],
  },
  FALLBACK: {
    title: "Application Trend",
    rangeLabel: "Last 12 weeks",
    periods: TREND_PERIODS,
    series: [
      { label: "Submitted", values: [2, 3, 4, 4, 5, 5, 6, 5, 6, 7, 7, 8], tone: "default" },
      { label: "Under Review", values: [1, 2, 2, 3, 3, 4, 3, 3, 4, 4, 5, 5], tone: "indigo" },
      { label: "Decisions", values: [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4], tone: "green" },
    ],
  },
};

const ROLE_TABLE_HINTS: Record<RoleName | "FALLBACK", string> = {
  APPLICANT: "Your recent applications and latest status updates",
  REVIEWER: "Assigned simulation records by review priority",
  IRB_ADMIN: "Current IRB pipeline records in simulation mode",
  RNEC_ADMIN: "National role-scoped simulation records",
  FINANCE: "Payment and finance-sensitive simulation records",
  CHAIRPERSON: "Agenda-relevant records in simulation mode",
  SYS_ADMIN: "Cross-role simulation records for operational visibility",
  FALLBACK: "Role-scoped simulation records",
};

function getRoleRecords(role: RoleName): DashboardApplication[] {
  const ids = ROLE_RECORD_IDS[role];
  return ids
    .map((id) => SIMULATION_RECORDS.find((item) => item.id === id))
    .filter((item): item is DashboardApplication => Boolean(item));
}

export function getStatusCounts(records: DashboardApplication[]): Record<ApplicationStatus, number> {
  return records.reduce<Record<ApplicationStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      DRAFT: 0,
      SUBMITTED: 0,
      PAYMENT_PENDING: 0,
      SCREENING: 0,
      UNDER_REVIEW: 0,
      QUERY_RAISED: 0,
      RESUBMITTED: 0,
      MEETING_SCHEDULED: 0,
      APPROVED: 0,
      CONDITIONALLY_APPROVED: 0,
      REVISIONS_REQUIRED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
      CLOSED: 0,
    },
  );
}

function getVariant(role: RoleName): RoleVariant {
  const records = getRoleRecords(role);
  const statusCounts = getStatusCounts(records);
  const inReviewCount = IN_REVIEW_STATUSES.reduce((sum, key) => sum + statusCounts[key], 0);
  const decisionsIssued = DECISION_STATUSES.reduce((sum, key) => sum + statusCounts[key], 0);
  const base = {
    records,
    role,
    trend: ROLE_TRENDS[role],
    tableTitle: "Recent Applications",
    tableHint: ROLE_TABLE_HINTS[role],
    distributionTitle: "Status Distribution",
    distributionActionLabel: "View all statuses",
    footerNote: "Static role simulation only - no live analytics binding yet.",
  };

  switch (role) {
    case "APPLICANT":
      return {
        ...base,
        roleLabel: "Applicant",
        eyebrow: "Applicant Workspace",
        title: "My Dashboard",
        subtitle: "Track personal applications, pending queries, and decisions.",
        secondaryAction: "View Queries",
        primaryAction: "Start Application",
        metrics: [
          { label: "My Applications", value: records.length, helper: "All submissions", icon: Activity },
          { label: "In Review", value: inReviewCount, helper: "Awaiting committee decision", icon: FileSearch, tone: "indigo" },
          { label: "Queries Raised", value: statusCounts.QUERY_RAISED, helper: "Need response", icon: MessageSquareMore, tone: "orange" },
          { label: "Approved", value: statusCounts.APPROVED + statusCounts.CONDITIONALLY_APPROVED, helper: "Decision complete", icon: CircleCheckBig, tone: "green" },
        ],
        highlightsTitle: "Applicant Highlights",
        highlights: [
          { label: "Draft applications", value: statusCounts.DRAFT },
          { label: "Submitted this month (static)", value: 2 },
          { label: "Latest pathway", value: "EXPEDITED" },
          { label: "Certificates available", value: 1 },
        ],
      };
    case "REVIEWER":
      return {
        ...base,
        roleLabel: "Reviewer",
        eyebrow: "Review Operations",
        title: "Reviewer Dashboard",
        subtitle: "Monitor assigned review queue and unresolved ethics queries.",
        secondaryAction: "Open Queue",
        primaryAction: "Start Review Session",
        metrics: [
          { label: "Assigned Queue", value: records.length, helper: "Cases allocated", icon: ClipboardList },
          { label: "Under Review", value: statusCounts.UNDER_REVIEW + statusCounts.RESUBMITTED, helper: "Active review", icon: FileSearch, tone: "indigo" },
          { label: "Query Follow-ups", value: statusCounts.QUERY_RAISED, helper: "Pending applicant response", icon: MessageSquareMore, tone: "orange" },
          { label: "Recommendations Filed", value: decisionsIssued, helper: "Submitted to committee", icon: CircleCheckBig, tone: "green" },
        ],
        highlightsTitle: "Reviewer Highlights",
        highlights: [
          { label: "Screening backlog", value: statusCounts.SCREENING },
          { label: "Meeting-ready dossiers", value: statusCounts.MEETING_SCHEDULED },
          { label: "Median age in queue (static)", value: "6 days" },
          { label: "Pending revisions", value: statusCounts.REVISIONS_REQUIRED },
        ],
      };
    case "IRB_ADMIN":
      return {
        ...base,
        roleLabel: "IRB Admin",
        eyebrow: "IRB Coordination",
        title: "IRB Admin Dashboard",
        subtitle: "Coordinate board flow, screening cadence, and committee throughput.",
        secondaryAction: "Manage Agenda",
        primaryAction: "Open IRB Control Room",
        metrics: [
          { label: "IRB Case Load", value: records.length, helper: "Current board scope", icon: Activity },
          { label: "Screening + Review", value: statusCounts.SCREENING + statusCounts.UNDER_REVIEW, helper: "Processing pipeline", icon: FileSearch, tone: "indigo" },
          { label: "Pending Queries", value: statusCounts.QUERY_RAISED, helper: "Awaiting applicant updates", icon: MessageSquareMore, tone: "orange" },
          { label: "Decisions Issued", value: decisionsIssued, helper: "Cycle output", icon: CircleCheckBig, tone: "green" },
        ],
        highlightsTitle: "IRB Highlights",
        highlights: [
          { label: "Meetings scheduled", value: statusCounts.MEETING_SCHEDULED },
          { label: "Conditional approvals", value: statusCounts.CONDITIONALLY_APPROVED },
          { label: "Escalations flagged (static)", value: 1 },
          { label: "Items waiting chair review", value: 2 },
        ],
      };
    case "RNEC_ADMIN":
      return {
        ...base,
        roleLabel: "RNEC Admin",
        eyebrow: "National Oversight",
        title: "RNEC Admin Dashboard",
        subtitle: "National-level ethics oversight across submissions and decision output.",
        secondaryAction: "View National Feed",
        primaryAction: "Open Oversight Console",
        metrics: [
          { label: "National Submissions", value: records.length, helper: "Tracked in this simulation", icon: Landmark },
          { label: "Active Review Workload", value: inReviewCount, helper: "Review lifecycle statuses", icon: FileSearch, tone: "indigo" },
          { label: "Open Queries", value: statusCounts.QUERY_RAISED, helper: "Require applicant actions", icon: MessageSquareMore, tone: "orange" },
          { label: "Finalized Decisions", value: decisionsIssued, helper: "Approved/rejected/closed", icon: CircleCheckBig, tone: "green" },
        ],
        highlightsTitle: "RNEC Highlights",
        highlights: [
          { label: "Approvals issued", value: statusCounts.APPROVED + statusCounts.CONDITIONALLY_APPROVED },
          { label: "Rejected studies", value: statusCounts.REJECTED },
          { label: "New high-priority flags (static)", value: 2 },
          { label: "IRB escalations (static)", value: 1 },
        ],
      };
    case "FINANCE":
      return {
        ...base,
        roleLabel: "Finance",
        eyebrow: "Finance Operations",
        title: "Finance Dashboard",
        subtitle: "Track payment-gated applications and fee processing workload.",
        secondaryAction: "View Invoices",
        primaryAction: "Open Payment Queue",
        metrics: [
          { label: "Payment Pending", value: statusCounts.PAYMENT_PENDING, helper: "Awaiting confirmation", icon: CreditCard, tone: "orange" },
          { label: "Eligible for Review", value: statusCounts.SUBMITTED + statusCounts.RESUBMITTED, helper: "Ready post-finance", icon: FileSearch, tone: "indigo" },
          { label: "Cleared This Month (static)", value: 5, helper: "Finance-verified", icon: CircleCheckBig, tone: "green" },
          { label: "Fee Exceptions (static)", value: 1, helper: "Needs admin decision", icon: AlertTriangle, tone: "violet" },
        ],
        highlightsTitle: "Finance Highlights",
        highlights: [
          { label: "Pending reconciliations (static)", value: 3 },
          { label: "Average clearance time (static)", value: "1.8 days" },
          { label: "Applications blocked by payment", value: statusCounts.PAYMENT_PENDING },
          { label: "Late remittance alerts (static)", value: 1 },
        ],
      };
    case "CHAIRPERSON":
      return {
        ...base,
        roleLabel: "Chairperson",
        eyebrow: "Governance Oversight",
        title: "Chairperson Dashboard",
        subtitle: "Focus on agenda readiness, meeting cadence, and decision governance.",
        secondaryAction: "Review Agenda",
        primaryAction: "Open Decision Desk",
        metrics: [
          { label: "Upcoming Meetings", value: statusCounts.MEETING_SCHEDULED, helper: "Agenda slots booked", icon: CalendarClock, tone: "violet" },
          { label: "Decision-Ready Cases", value: statusCounts.UNDER_REVIEW + statusCounts.REVISIONS_REQUIRED, helper: "Needs board resolution", icon: FileSearch, tone: "indigo" },
          { label: "Conditional Decisions", value: statusCounts.CONDITIONALLY_APPROVED, helper: "Needs follow-up", icon: MessageSquareMore, tone: "orange" },
          { label: "Final Decisions", value: decisionsIssued, helper: "Closed outcomes", icon: CircleCheckBig, tone: "green" },
        ],
        highlightsTitle: "Chairperson Highlights",
        highlights: [
          { label: "Agenda overflow (static)", value: 2 },
          { label: "Cases deferred (static)", value: 1 },
          { label: "Pending quorum checks (static)", value: 1 },
          { label: "Last decision session (static)", value: "2 days ago" },
        ],
      };
    case "SYS_ADMIN":
      return {
        ...base,
        roleLabel: "System Admin",
        eyebrow: "Platform Operations",
        title: "System Admin Dashboard",
        subtitle: "Cross-tenant platform health and operational control signals.",
        secondaryAction: "Tenant Index",
        primaryAction: "Open Admin Console",
        metrics: [
          { label: "Active Tenants (static)", value: 6, helper: "Enabled organizations", icon: Landmark },
          { label: "Role Assignments (static)", value: 28, helper: "Current user-role links", icon: Users, tone: "indigo" },
          { label: "Pending Ops Alerts (static)", value: 3, helper: "Needs investigation", icon: AlertTriangle, tone: "orange" },
          { label: "Config Changes Today (static)", value: 4, helper: "Audit-tracked updates", icon: Settings2, tone: "green" },
        ],
        highlightsTitle: "System Highlights",
        highlights: [
          { label: "Auth refresh failures (static)", value: 0 },
          { label: "Recent tenant provisioning (static)", value: 1 },
          { label: "API error spikes (static)", value: "none" },
          { label: "Audit anomalies (static)", value: 0 },
        ],
      };
  }
}

function buildFallbackVariant(): RoleVariant {
  const records = SIMULATION_RECORDS.slice(0, 6);
  return {
    role: "FALLBACK",
    roleLabel: "Unknown",
    eyebrow: "Operations Snapshot",
    title: "Dashboard",
    subtitle: "Role could not be resolved. Showing default static simulation.",
    secondaryAction: "View Summary",
    primaryAction: "Open Dashboard",
    records,
    trend: ROLE_TRENDS.FALLBACK,
    tableTitle: "Recent Applications",
    tableHint: ROLE_TABLE_HINTS.FALLBACK,
    distributionTitle: "Status Distribution",
    distributionActionLabel: "View all statuses",
    metrics: [
      { label: "Tracked Applications", value: records.length, helper: "Static sample", icon: Activity },
      { label: "Under Review", value: records.filter((r) => r.status === "UNDER_REVIEW").length, helper: "Review workload", icon: FileSearch, tone: "indigo" },
      { label: "Queries", value: records.filter((r) => r.status === "QUERY_RAISED").length, helper: "Pending applicant response", icon: MessageSquareMore, tone: "orange" },
      { label: "Decisions", value: records.filter((r) => DECISION_STATUSES.includes(r.status)).length, helper: "Decision outcomes", icon: CircleCheckBig, tone: "green" },
    ],
    highlightsTitle: "Snapshot Highlights",
    highlights: [
      { label: "Fallback mode", value: "active" },
      { label: "Primary role missing", value: "yes" },
      { label: "Simulation type", value: "static" },
      { label: "Action needed", value: "verify role assignment" },
    ],
    footerNote: "Static fallback mode only - verify /auth/me role payload.",
  };
}

export function resolvePrimaryRoleName(
  assignments: TenantRoleAssignment[] | undefined,
): RoleName | null {
  if (!assignments || assignments.length === 0) return null;
  const selected = assignments.find((item) => item.isPrimary) ?? assignments[0];
  const roleName = selected.roleName?.toUpperCase();
  if (!roleName) return null;
  return ROLE_NAME_SET.has(roleName as RoleName) ? (roleName as RoleName) : null;
}

export function getRoleVariant(roleName: RoleName | null): RoleVariant {
  if (!roleName) return buildFallbackVariant();
  return getVariant(roleName);
}
