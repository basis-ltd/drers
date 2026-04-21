import { Badge } from "@/components/ui/badge";
import type {
  ApplicationStatus,
  ApplicationType,
  ResearchArea,
  ReviewPathway,
} from "@/features/applications/api/types";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CircleCheckBig,
  ClipboardList,
  FileSearch,
  MessageSquareMore,
} from "lucide-react";

type DashboardApplication = {
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

const MOCK_APPLICATIONS: DashboardApplication[] = [
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
];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "border-primary/20 bg-primary/6 text-primary/70",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  SCREENING: {
    label: "Screening",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  QUERY_RAISED: {
    label: "Query Raised",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  RESUBMITTED: {
    label: "Resubmitted",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  MEETING_SCHEDULED: {
    label: "Meeting Scheduled",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  APPROVED: {
    label: "Approved",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  CONDITIONALLY_APPROVED: {
    label: "Conditionally Approved",
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
  REVISIONS_REQUIRED: {
    label: "Revisions Required",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "border-slate-200 bg-slate-50 text-slate-500",
  },
  CLOSED: {
    label: "Closed",
    className: "border-slate-200 bg-slate-50 text-slate-500",
  },
};

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

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function humanize(value: string): string {
  return value.toLowerCase().split("_").map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1)).join(" ");
}

export function DashboardPage() {
  const statusCounts = MOCK_APPLICATIONS.reduce<Record<ApplicationStatus, number>>(
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

  const totalApplications = MOCK_APPLICATIONS.length;
  const inReviewCount = IN_REVIEW_STATUSES.reduce((sum, key) => sum + statusCounts[key], 0);
  const queryCount = statusCounts.QUERY_RAISED;
  const decisionsIssued = DECISION_STATUSES.reduce((sum, key) => sum + statusCounts[key], 0);
  const pendingScreening = statusCounts.SCREENING + statusCounts.PAYMENT_PENDING;
  const upcomingMeetings = statusCounts.MEETING_SCHEDULED;

  const statusBreakdown = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const topArea = Object.entries(
    MOCK_APPLICATIONS.reduce<Record<string, number>>((acc, item) => {
      const key = item.details.area;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1])[0];

  const lastRefresh = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-full space-y-6 px-4 py-8 md:px-8">
      <header className="rounded-2xl border border-primary/12 bg-gradient-to-br from-white via-white to-primary/[0.03] p-5 shadow-sm">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-primary/40 uppercase">
              Research Ethics Oversight
            </p>
            <h1 className="heading-page mt-1.5">Admin Dashboard</h1>
            <p className="mt-1 text-[12px] text-primary/50">
              Static simulation of current application records and review workload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-white px-3 py-1.5 text-[11px] font-medium text-primary/60 transition-colors hover:bg-primary/6 hover:text-primary"
            >
              Export Snapshot
              <ArrowUpRight className="size-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Open Review Queue
              <ClipboardList className="size-3.5" />
            </button>
          </div>
        </section>
        <p className="mt-4 text-[11px] text-primary/40">
          Last updated: {lastRefresh}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={totalApplications}
          helper="All recorded submissions"
          icon={<Activity className="size-4.5 text-primary/60" />}
        />
        <StatCard
          label="In Review"
          value={inReviewCount}
          helper="Pending ethics decision"
          icon={<FileSearch className="size-4.5 text-indigo-700" />}
          iconClassName="bg-indigo-50"
        />
        <StatCard
          label="Queries Raised"
          value={queryCount}
          helper="Awaiting applicant response"
          icon={<MessageSquareMore className="size-4.5 text-orange-700" />}
          iconClassName="bg-orange-50"
        />
        <StatCard
          label="Decisions Issued"
          value={decisionsIssued}
          helper="Approved/Rejected/Closed"
          icon={<CircleCheckBig className="size-4.5 text-green-700" />}
          iconClassName="bg-green-50"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">Recent Applications</h2>
            <p className="text-[11px] text-primary/40">Most recently updated records</p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left">
                  <th className="border-b border-primary/8 px-2 py-2 text-[10px] font-semibold tracking-[0.07em] text-primary/40 uppercase">
                    Reference
                  </th>
                  <th className="border-b border-primary/8 px-2 py-2 text-[10px] font-semibold tracking-[0.07em] text-primary/40 uppercase">
                    Title
                  </th>
                  <th className="border-b border-primary/8 px-2 py-2 text-[10px] font-semibold tracking-[0.07em] text-primary/40 uppercase">
                    Type
                  </th>
                  <th className="border-b border-primary/8 px-2 py-2 text-[10px] font-semibold tracking-[0.07em] text-primary/40 uppercase">
                    Pathway
                  </th>
                  <th className="border-b border-primary/8 px-2 py-2 text-[10px] font-semibold tracking-[0.07em] text-primary/40 uppercase">
                    Status
                  </th>
                  <th className="border-b border-primary/8 px-2 py-2 text-[10px] font-semibold tracking-[0.07em] text-primary/40 uppercase">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_APPLICATIONS.slice(0, 8).map((application) => (
                  <tr key={application.id} className="transition-colors hover:bg-primary/[0.025]">
                    <td className="px-2 py-2.5 text-[11px] font-medium text-primary/70">
                      {application.referenceNumber}
                    </td>
                    <td className="max-w-[260px] px-2 py-2.5 text-[12px] text-primary/70">
                      <p className="line-clamp-2">{application.details.title}</p>
                      <p className="mt-0.5 text-[10px] text-primary/35">
                        {humanize(application.details.area)}
                      </p>
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-primary/60">
                      {humanize(application.type)}
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-primary/60">
                      {humanize(application.details.pathway)}
                    </td>
                    <td className="px-2 py-2.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${STATUS_CONFIG[application.status].className}`}
                      >
                        {STATUS_CONFIG[application.status].label}
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5 text-[11px] whitespace-nowrap text-primary/40">
                      {formatDate(application.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <section className="space-y-4">
          <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
            <h2 className="heading-section mb-3">Status Distribution</h2>
            <div className="space-y-2.5">
              {statusBreakdown.map(([status, count]) => {
                const percentage = Math.max(
                  Math.round((count / totalApplications) * 100),
                  8,
                );
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-primary/60">{STATUS_CONFIG[status as ApplicationStatus].label}</span>
                      <span className="font-medium text-primary/55">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary/8">
                      <div className="h-full rounded-full bg-primary/65" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
            <h2 className="heading-section mb-3">Operational Highlights</h2>
            <ul className="space-y-2 text-[11px] text-primary/60">
              <li className="flex items-start justify-between rounded-md bg-primary/[0.03] px-2.5 py-2">
                <span>Pending screening and payment checks</span>
                <strong className="text-primary/80">{pendingScreening}</strong>
              </li>
              <li className="flex items-start justify-between rounded-md bg-primary/[0.03] px-2.5 py-2">
                <span>Meetings currently scheduled</span>
                <strong className="text-primary/80">{upcomingMeetings}</strong>
              </li>
              <li className="flex items-start justify-between rounded-md bg-primary/[0.03] px-2.5 py-2">
                <span>Most frequent research area</span>
                <strong className="text-primary/80">
                  {topArea ? humanize(topArea[0]) : "—"}
                </strong>
              </li>
              <li className="flex items-start justify-between rounded-md bg-primary/[0.03] px-2.5 py-2">
                <span>New submissions this month (static)</span>
                <strong className="text-primary/80">4</strong>
              </li>
            </ul>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-primary/35">
              <CalendarClock className="size-3.5" />
              Static simulation only - no live backend binding yet.
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon,
  iconClassName,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ReactNode;
  iconClassName?: string;
}) {
  return (
    <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm transition-transform hover:scale-[1.01]">
      <div
        className={`mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/[0.07] ${iconClassName ?? ""}`}
        aria-hidden
      >
        {icon}
      </div>
      <p className="text-[22px] leading-none font-semibold text-primary/85">{value}</p>
      <p className="mt-1 text-[12px] font-medium text-primary/65">{label}</p>
      <p className="mt-0.5 text-[10px] text-primary/40">{helper}</p>
    </article>
  );
}
