import { useMeQuery } from "@/features/auth/api/authApi";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/features/applications/api/types";
import { CalendarClock, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getRoleVariant,
  getStatusCounts,
  resolvePrimaryRoleName,
  STATUS_CONFIG,
  type MetricTone,
  type VariantTrendSeries,
  type VariantMetric,
} from "./dashboardRoleData";

const RING_COLORS = ["#2563eb", "#8b5cf6", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444"];
const PRIORITY_ROLES = new Set(["REVIEWER", "IRB_ADMIN", "RNEC_ADMIN", "SYS_ADMIN"]);
const TREND_COLOR_BY_TONE: Record<MetricTone, string> = {
  default: "#2563eb",
  indigo: "#8b5cf6",
  orange: "#f59e0b",
  green: "#10b981",
  violet: "#7c3aed",
};

export function DashboardPage() {
  const { data: meData, isLoading, isFetching } = useMeQuery();
  const roleName = resolvePrimaryRoleName(meData?.roles);
  const variant = getRoleVariant(roleName);
  const isPriorityRole = PRIORITY_ROLES.has(variant.role);
  const statusCounts = getStatusCounts(variant.records);
  const statusBreakdown = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const statusOverview = statusBreakdown.slice(0, 6);
  const statusTotal = Math.max(variant.records.length, 1);

  const lastRefresh = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main
      className={`min-h-full px-4 py-8 md:px-8 ${isPriorityRole ? "bg-gradient-to-b from-primary/[0.05] to-transparent" : ""}`}
    >
      <div className="mx-auto w-full max-w-[1300px] space-y-5">
        <header className="rounded-2xl border border-primary/10 bg-white/95 p-5 shadow-sm backdrop-blur">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="eyebrow-label text-primary/60">{variant.eyebrow}</p>
              <h1 className="heading-page mt-1">{variant.title}</h1>
              <p className="mt-1 text-[13px] text-primary/65">{variant.subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-6 border-primary/15 bg-primary/4 text-[11px] text-primary/75"
                >
                  Active role: {variant.roleLabel}
                </Badge>
                {isPriorityRole ? (
                  <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[11px] font-medium text-primary/75">
                    Operations snapshot
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={variant.primaryActionRoute}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                {variant.primaryAction}
                <ClipboardList className="size-3.5" />
              </Link>
            </div>
          </section>
          <p className="mt-4 text-[12px] text-primary/55">
            Last updated: {lastRefresh}
            {isLoading || isFetching ? " - resolving role..." : ""}
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {variant.metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} emphasize={isPriorityRole} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <header className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="heading-section">{variant.trend.title}</h2>
                <p className="text-[12px] text-primary/55">{variant.trend.rangeLabel}</p>
              </div>
            </header>
            <TrendChart periods={variant.trend.periods} series={variant.trend.series} />
          </article>

          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center justify-between gap-2">
              <h2 className="heading-section">{variant.distributionTitle}</h2>
              <span className="text-[11px] font-medium text-primary/55">
                {variant.distributionActionLabel}
              </span>
            </header>
            <div className="grid gap-4 sm:grid-cols-[122px_1fr] sm:items-center">
              <div className="relative mx-auto size-[122px]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: buildStatusRing(statusOverview, statusTotal) }}
                />
                <div className="absolute inset-[16px] rounded-full bg-white shadow-inner" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[28px] leading-none font-semibold text-primary/90">
                    {variant.records.length}
                  </span>
                  <span className="mt-1 text-[11px] text-primary/55">Total</span>
                </div>
              </div>
              <ul className="space-y-2.5">
                {statusOverview.map(([status, count], index) => (
                  <li
                    key={status}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-[12px]"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: RING_COLORS[index % RING_COLORS.length] }}
                      aria-hidden
                    />
                    <span className="text-primary/70">
                      {STATUS_CONFIG[status as ApplicationStatus].label}
                    </span>
                    <span className="font-medium text-primary/75">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center justify-between gap-3">
              <h2 className="heading-section">{variant.tableTitle}</h2>
              <p className="text-[12px] text-primary/55">{variant.tableHint}</p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0">
                <caption className="sr-only">
                  Recent applications with reference, title, type, pathway, status, and update date
                </caption>
                <thead>
                  <tr className="text-left">
                    <th
                      scope="col"
                      className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase"
                    >
                      Reference
                    </th>
                    <th
                      scope="col"
                      className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase"
                    >
                      Pathway
                    </th>
                    <th
                      scope="col"
                      className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase"
                    >
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variant.records.map((application) => (
                    <tr key={application.id} className="transition-colors hover:bg-primary/[0.025]">
                      <td className="px-2 py-2.5 text-[12px] font-medium text-primary/80">
                        {application.referenceNumber}
                      </td>
                      <td className="max-w-[260px] px-2 py-2.5 text-[13px] text-primary/80">
                        <p className="line-clamp-2">{application.details.title}</p>
                        <p className="mt-0.5 text-[11px] text-primary/55">
                          {humanize(application.details.area)}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 text-[12px] text-primary/70">
                        {humanize(application.type)}
                      </td>
                      <td className="px-2 py-2.5 text-[12px] text-primary/70">
                        {humanize(application.details.pathway)}
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge
                          variant="outline"
                          className={`h-6 text-[11px] font-medium ${STATUS_CONFIG[application.status].className}`}
                        >
                          {STATUS_CONFIG[application.status].label}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-[12px] whitespace-nowrap text-primary/55">
                        {formatDate(application.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <h2 className="heading-section mb-3">{variant.highlightsTitle}</h2>
            <ul className="space-y-2 text-[12px] text-primary/70">
              {variant.highlights.map((highlight) => (
                <li
                  key={highlight.label}
                  className="flex items-start justify-between rounded-lg bg-primary/[0.03] px-3 py-2.5"
                >
                  <span>{highlight.label}</span>
                  <strong className="text-primary/85">{highlight.value}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-primary/50">
              <CalendarClock className="size-3.5" />
              {variant.footerNote}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1))
    .join(" ");
}

function toneClassName(tone: MetricTone): string {
  switch (tone) {
    case "indigo":
      return "bg-indigo-50 text-indigo-800";
    case "orange":
      return "bg-amber-50 text-amber-800";
    case "green":
      return "bg-emerald-50 text-emerald-800";
    case "violet":
      return "bg-violet-50 text-violet-800";
    default:
      return "bg-primary/[0.07] text-primary/70";
  }
}

function buildStatusRing(
  entries: [string, number][],
  total: number,
): string {
  if (entries.length === 0) return "conic-gradient(#cbd5e1 0% 100%)";
  let offset = 0;
  const stops = entries.map(([, count], index) => {
    const start = offset;
    offset += (count / total) * 100;
    const color = RING_COLORS[index % RING_COLORS.length];
    return `${color} ${start}% ${offset}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function buildLinePoints(values: number[], maxValue: number, width: number, height: number): string {
  const horizontalPadding = 20;
  const verticalPadding = 16;
  const chartWidth = width - horizontalPadding * 2;
  const chartHeight = height - verticalPadding * 2;
  return values
    .map((value, index) => {
      const x = horizontalPadding + (chartWidth * index) / Math.max(values.length - 1, 1);
      const y = verticalPadding + (1 - value / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function TrendChart({
  periods,
  series,
}: {
  periods: string[];
  series: VariantTrendSeries[];
}) {
  const width = 760;
  const height = 240;
  const maxValue = Math.max(1, ...series.flatMap((entry) => entry.values));
  const labelIndexes = [
    0,
    Math.floor(periods.length / 3),
    Math.floor((periods.length * 2) / 3),
    periods.length - 1,
  ].filter((value, index, array) => array.indexOf(value) === index);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {series.map((entry) => (
          <span key={entry.label} className="inline-flex items-center gap-1.5 text-[12px] text-primary/65">
            <span
              className="h-0.5 w-5 rounded-full"
              style={{ backgroundColor: TREND_COLOR_BY_TONE[entry.tone ?? "default"] }}
              aria-hidden
            />
            {entry.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[240px] w-full rounded-xl bg-primary/[0.015] p-2"
        role="img"
        aria-label="Trend chart for recent dashboard activity"
      >
        {[0.2, 0.4, 0.6, 0.8].map((line) => (
          <line
            key={line}
            x1={20}
            x2={width - 20}
            y1={height * line}
            y2={height * line}
            stroke="#dbe7ff"
            strokeWidth="1"
          />
        ))}
        {series.map((entry) => (
          <polyline
            key={entry.label}
            fill="none"
            stroke={TREND_COLOR_BY_TONE[entry.tone ?? "default"]}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={buildLinePoints(entry.values, maxValue, width, height)}
          />
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] text-primary/45">
        {labelIndexes.map((index) => (
          <span key={`${periods[index]}-${index}`}>{periods[index]}</span>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
  emphasize = false,
}: VariantMetric) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition-transform hover:-translate-y-0.5 ${emphasize ? "border-primary/12 bg-white" : "border-primary/10 bg-white"}`}
    >
      <div
        className={`mb-3 flex size-9 items-center justify-center rounded-lg ${toneClassName(tone)}`}
        aria-hidden
      >
        <Icon className="size-4.5" />
      </div>
      <p className="text-[24px] leading-none font-semibold text-primary/90">{value}</p>
      <p className="mt-1 text-[13px] font-medium text-primary/75">{label}</p>
      <p className="mt-0.5 text-[12px] text-primary/55">{helper}</p>
    </article>
  );
}
