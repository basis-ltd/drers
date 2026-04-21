import { useMeQuery } from "@/features/auth/api/authApi";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/features/applications/api/types";
import { ArrowUpRight, CalendarClock, ClipboardList } from "lucide-react";
import {
  getRoleVariant,
  getStatusCounts,
  resolvePrimaryRoleName,
  STATUS_CONFIG,
  type MetricTone,
  type VariantMetric,
} from "./dashboardRoleData";

export function DashboardPage() {
  const { data: meData, isLoading, isFetching } = useMeQuery();
  const roleName = resolvePrimaryRoleName(meData?.roles);
  const variant = getRoleVariant(roleName);
  const statusCounts = getStatusCounts(variant.records);
  const statusBreakdown = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const lastRefresh = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-full space-y-6 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <header className="rounded-lg border border-primary/12 bg-white p-5 shadow-sm">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow-label text-primary/55">
              {variant.eyebrow}
            </p>
            <h1 className="heading-page mt-1.5">{variant.title}</h1>
            <p className="mt-1 text-[13px] text-primary/65">{variant.subtitle}</p>
            <div className="mt-2.5">
              <Badge
                variant="outline"
                className="h-6 border-primary/15 bg-primary/4 text-[11px] text-primary/75"
              >
                Active role: {variant.roleLabel}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-white px-3 py-2 text-[12px] font-medium text-primary/70 transition-colors hover:bg-primary/6 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {variant.secondaryAction}
              <ArrowUpRight className="size-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              {variant.primaryAction}
              <ClipboardList className="size-3.5" />
            </button>
          </div>
        </section>
        <p className="mt-4 text-[12px] text-primary/55">
          Last updated: {lastRefresh}
          {isLoading || isFetching ? " - resolving role..." : ""}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {variant.metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">Recent Applications</h2>
            <p className="text-[12px] text-primary/55">Role-scoped simulation records</p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0">
              <caption className="sr-only">
                Recent applications with reference, title, type, pathway, status, and update date
              </caption>
              <thead>
                <tr className="text-left">
                  <th scope="col" className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase">
                    Reference
                  </th>
                  <th scope="col" className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase">
                    Title
                  </th>
                  <th scope="col" className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase">
                    Type
                  </th>
                  <th scope="col" className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase">
                    Pathway
                  </th>
                  <th scope="col" className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase">
                    Status
                  </th>
                  <th scope="col" className="border-b border-primary/8 px-2 py-2 text-[11px] font-semibold tracking-[0.07em] text-primary/55 uppercase">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {variant.records.map((application) => (
                  <tr
                    key={application.id}
                    className="transition-colors hover:bg-primary/[0.025]"
                  >
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

        <section className="space-y-4">
          <article className="rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
            <h2 className="heading-section mb-3">Status Distribution</h2>
            <div className="space-y-2.5">
              {statusBreakdown.map(([status, count]) => {
                const percentage = Math.max(
                  Math.round((count / Math.max(variant.records.length, 1)) * 100),
                  8,
                );
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-primary/70">
                        {STATUS_CONFIG[status as ApplicationStatus].label}
                      </span>
                      <span className="font-medium text-primary/70">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary/8">
                      <div
                        className="h-full rounded-full bg-primary/65"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
            <h2 className="heading-section mb-3">{variant.highlightsTitle}</h2>
            <ul className="space-y-2 text-[12px] text-primary/70">
              {variant.highlights.map((highlight) => (
                <li
                  key={highlight.label}
                  className="flex items-start justify-between rounded-md bg-primary/[0.03] px-2.5 py-2"
                >
                  <span>{highlight.label}</span>
                  <strong className="text-primary/85">{highlight.value}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-primary/50">
              <CalendarClock className="size-3.5" />
              {variant.footerNote}
            </div>
          </article>
        </section>
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

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: VariantMetric) {
  return (
    <article className="rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
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
