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
      <header className="rounded-2xl border border-primary/12 bg-gradient-to-br from-white via-white to-primary/[0.03] p-5 shadow-sm">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-primary/40 uppercase">
              {variant.eyebrow}
            </p>
            <h1 className="heading-page mt-1.5">{variant.title}</h1>
            <p className="mt-1 text-[12px] text-primary/50">{variant.subtitle}</p>
            <div className="mt-2.5">
              <Badge
                variant="outline"
                className="border-primary/15 bg-primary/4 text-[10px] text-primary/65"
              >
                Active role: {variant.roleLabel}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-white px-3 py-1.5 text-[11px] font-medium text-primary/60 transition-colors hover:bg-primary/6 hover:text-primary"
            >
              {variant.secondaryAction}
              <ArrowUpRight className="size-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              {variant.primaryAction}
              <ClipboardList className="size-3.5" />
            </button>
          </div>
        </section>
        <p className="mt-4 text-[11px] text-primary/40">
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
        <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">Recent Applications</h2>
            <p className="text-[11px] text-primary/40">Role-scoped simulation records</p>
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
                {variant.records.map((application) => (
                  <tr
                    key={application.id}
                    className="transition-colors hover:bg-primary/[0.025]"
                  >
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
                  Math.round((count / Math.max(variant.records.length, 1)) * 100),
                  8,
                );
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-primary/60">
                        {STATUS_CONFIG[status as ApplicationStatus].label}
                      </span>
                      <span className="font-medium text-primary/55">{count}</span>
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

          <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
            <h2 className="heading-section mb-3">{variant.highlightsTitle}</h2>
            <ul className="space-y-2 text-[11px] text-primary/60">
              {variant.highlights.map((highlight) => (
                <li
                  key={highlight.label}
                  className="flex items-start justify-between rounded-md bg-primary/[0.03] px-2.5 py-2"
                >
                  <span>{highlight.label}</span>
                  <strong className="text-primary/80">{highlight.value}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-primary/35">
              <CalendarClock className="size-3.5" />
              {variant.footerNote}
            </div>
          </article>
        </section>
      </section>
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
      return "bg-indigo-50 text-indigo-700";
    case "orange":
      return "bg-orange-50 text-orange-700";
    case "green":
      return "bg-green-50 text-green-700";
    case "violet":
      return "bg-violet-50 text-violet-700";
    default:
      return "bg-primary/[0.07] text-primary/60";
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
    <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm transition-transform hover:scale-[1.01]">
      <div
        className={`mb-3 flex size-9 items-center justify-center rounded-lg ${toneClassName(tone)}`}
        aria-hidden
      >
        <Icon className="size-4.5" />
      </div>
      <p className="text-[22px] leading-none font-semibold text-primary/85">{value}</p>
      <p className="mt-1 text-[12px] font-medium text-primary/65">{label}</p>
      <p className="mt-0.5 text-[10px] text-primary/40">{helper}</p>
    </article>
  );
}
