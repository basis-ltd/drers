import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Table } from "@/components/Table";
import { useListApplicationsQuery } from "@/features/applications/api/applicationsApi";
import type {
  Application,
  ApplicationListScope,
  ApplicationStatus,
} from "@/features/applications/api/types";
import { faFile, faFilter, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomPopover from "@/components/CustomPopover";
import {
  TableActionButton,
  TableActionButtonTrigger,
} from "@/components/TableActionButton";
import { capitalizeString, formatDate } from "@/utils/strings.utils";
import {
  STATUS_STYLES as STATUS_CONFIG,
  isReviewEligible,
} from "@/features/applications/utils/statusStyles";
import { useRoles } from "@/features/auth/hooks/useRoles";
import { faEye, faGavel } from "@fortawesome/free-solid-svg-icons";

const ALL_APPLICATION_STATUSES = Object.keys(
  STATUS_CONFIG,
) as ApplicationStatus[];
const REVIEW_DEFAULT_STATUSES = ALL_APPLICATION_STATUSES.filter((status) =>
  isReviewEligible(status),
);

function getDefaultStatuses(scope: ApplicationListScope): ApplicationStatus[] {
  return scope === "REVIEW" ? REVIEW_DEFAULT_STATUSES : ALL_APPLICATION_STATUSES;
}

function areStatusSetsEqual(a: ApplicationStatus[], b: ApplicationStatus[]) {
  if (a.length !== b.length) return false;
  const bSet = new Set(b);
  return a.every((value) => bSet.has(value));
}

export function MyApplicationsPage() {
  const [scope, setScope] = useState<ApplicationListScope | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<
    ApplicationStatus[] | null
  >(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { roles, isReviewer, isChairperson, isAdmin, isLoading: rolesLoading } =
    useRoles();
  const canReview = isReviewer || isChairperson || isAdmin;
  const hasApplicantRole = roles.includes("APPLICANT");
  const canToggleScope = canReview && hasApplicantRole;
  const activeScope = scope ?? (canReview ? "REVIEW" : "MY");
  const activeStatuses = selectedStatuses ?? getDefaultStatuses(activeScope);
  const scopeLabel = activeScope === "REVIEW" ? "review queue" : "my applications";

  const queryStatuses = useMemo(() => {
    const defaults = getDefaultStatuses(activeScope);
    if (activeStatuses.length === 0) return undefined;
    if (areStatusSetsEqual(activeStatuses, defaults)) return undefined;
    return activeStatuses;
  }, [activeScope, activeStatuses]);

  const { data, isLoading } = useListApplicationsQuery({
    scope: activeScope,
    statuses: queryStatuses,
    page,
    limit: PAGE_SIZE,
  }, { skip: rolesLoading });

  const applications = data?.data ?? [];
  const pageLoading = isLoading || rolesLoading;

  const filtered = applications.filter((app) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.details?.title?.toLowerCase().includes(q) ||
      app.referenceNumber.toLowerCase().includes(q)
    );
  });

  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      {
        header: "Reference",
        accessorKey: "referenceNumber",
      },
      {
        header: "Study Title",
        accessorKey: "details.title",
      },
      {
        header: "Research Area",
        accessorKey: "details.area",
        cell: ({ row }) => capitalizeString(row.original.details?.area),
      },
      {
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="border-primary/15 bg-primary/4 text-[10px] font-medium text-primary/60"
          >
            {capitalizeString(row?.original?.type)}
          </Badge>
        ),
      },
      {
        header: "Pathway",
        cell: ({ row }) =>
          row.original.details?.pathway ? (
            <Badge
              variant="outline"
              className={`text-[10px] font-normal ${
                row.original.details?.pathway === "FULL"
                  ? "border-primary/20 bg-primary/6 text-primary/70"
                  : row.original.details?.pathway === "EXPEDITED"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {capitalizeString(row.original.details?.pathway)}
            </Badge>
          ) : (
            <span className="text-[11px] text-primary/25">—</span>
          ),
      },
      {
        header: "Status",
        cell: ({ row }) => {
          const statusCfg = STATUS_CONFIG[row.original.status] ?? {
            label: row.original.status,
            className: "",
          };
          return (
            <Badge
              variant="outline"
              className={`text-[10px] font-medium ${statusCfg.className}`}
            >
              {capitalizeString(statusCfg.label)}
            </Badge>
          );
        },
      },
      {
        header: "Submitted",
        cell: ({ row }) => (
          <span className="text-[11px] whitespace-nowrap text-primary/40">
            {row?.original?.submittedAt
              ? formatDate(row?.original?.submittedAt, "DD/MM/YYYY")
              : "—"}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          return (
            <CustomPopover
              trigger={<TableActionButtonTrigger />}
              className="flex gap-2"
            >
              <menu className="w-full flex flex-col gap-1">
                <TableActionButton
                  to={`/applications/${row.original.id}`}
                  label="View"
                  icon={faEye}
                />
                {["DRAFT"].includes(row.original.status) && (
                  <TableActionButton
                    to={`/applications/${row.original.id}/edit`}
                    label="Continue"
                    icon={faPenToSquare}
                  />
                )}
                {canReview && isReviewEligible(row.original.status) && (
                  <TableActionButton
                    to={`/applications/${row.original.id}/review`}
                    label="Review"
                    icon={faGavel}
                  />
                )}
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [canReview],
  );

  const statusSelectionLabel =
    activeStatuses.length === 0
      ? "No statuses"
      : activeStatuses.length === ALL_APPLICATION_STATUSES.length
        ? "All statuses"
        : `${activeStatuses.length} selected`;

  const setScopeAndResetFilters = (nextScope: ApplicationListScope) => {
    setScope(nextScope);
    setSelectedStatuses(getDefaultStatuses(nextScope));
    setPage(1);
  };

  const toggleStatus = (status: ApplicationStatus, checked: boolean) => {
    setSelectedStatuses((prev) => {
      const current = prev ?? getDefaultStatuses(activeScope);
      if (checked) {
        return current.includes(status) ? current : [...current, status];
      }
      return current.filter((value) => value !== status);
    });
    setPage(1);
  };

  return (
    <main className="min-h-full px-4 py-8 md:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <section>
          <h1 className="heading-page">My Applications</h1>
          <p className="mt-0.5 text-[11px] text-primary/50">
            Track and manage all your research ethics submissions
          </p>
        </section>
        <Button
          primary
          value="New Application"
          icon={faPlus}
          route="/applications/new"
        />
      </header>

      {/* Filters + Search */}
      <section className="mb-4 flex flex-wrap items-center gap-3">
        {canToggleScope && (
          <nav
            aria-label="Application view scope"
            className="flex flex-wrap gap-1 rounded-md border border-primary/10 bg-white p-1"
          >
            <button
              type="button"
              onClick={() => setScopeAndResetFilters("MY")}
              className={`rounded-md px-3.5 py-1.5 text-[11px] font-medium transition-colors ${
                activeScope === "MY"
                  ? "bg-primary text-primary-foreground"
                  : "text-primary/50 hover:bg-primary/6 hover:text-primary"
              }`}
            >
              My applications
            </button>
            <button
              type="button"
              onClick={() => setScopeAndResetFilters("REVIEW")}
              className={`rounded-md px-3.5 py-1.5 text-[11px] font-medium transition-colors ${
                activeScope === "REVIEW"
                  ? "bg-primary text-primary-foreground"
                  : "text-primary/50 hover:bg-primary/6 hover:text-primary"
              }`}
            >
              Review queue
            </button>
          </nav>
        )}

        <CustomPopover
          trigger={
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-primary/15 bg-white px-3 text-[11px] font-medium text-primary/60 hover:bg-primary/6 hover:text-primary"
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Status</span>
              <span className="text-primary/45">({statusSelectionLabel})</span>
            </button>
          }
          className="min-w-[250px]"
        >
          <section className="flex flex-col gap-2">
            <menu className="flex max-h-[48vh] flex-col gap-1 overflow-y-auto">
              {ALL_APPLICATION_STATUSES.map((status) => {
                const checked = activeStatuses.includes(status);
                const statusLabel = STATUS_CONFIG[status]?.label ?? status;
                return (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 hover:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        toggleStatus(status, event.target.checked)
                      }
                      className="accent-primary"
                    />
                    <span className="text-[12px] text-secondary">
                      {capitalizeString(statusLabel)}
                    </span>
                  </label>
                );
              })}
            </menu>
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-primary/10 pt-2">
              <button
                type="button"
                className="rounded-md border border-primary/10 px-2 py-1 text-[11px] text-secondary hover:bg-background"
                onClick={() => {
                  setSelectedStatuses([]);
                  setPage(1);
                }}
              >
                Clear all
              </button>
              <button
                type="button"
                className="rounded-md border border-primary/10 px-2 py-1 text-[11px] text-secondary hover:bg-background"
                onClick={() => {
                  setSelectedStatuses(ALL_APPLICATION_STATUSES);
                  setPage(1);
                }}
              >
                Select all
              </button>
            </div>
          </section>
        </CustomPopover>

        <section className="ml-auto">
          <Input
            type="search"
            placeholder="Search by title or reference…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            showSearchSuffix
            className="w-56"
          />
        </section>
      </section>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        isLoading={pageLoading}
        emptyState={<EmptyState hasSearch={!!search} scopeLabel={scopeLabel} />}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPage,
        }}
      />
    </main>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  hasSearch,
  scopeLabel,
}: {
  hasSearch: boolean;
  scopeLabel: string;
}) {
  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <figure
        className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/6"
        aria-hidden
      >
        <FontAwesomeIcon icon={faFile} className="size-6 text-primary/30" />
      </figure>
      <p className="text-[13px] font-medium text-primary/60">
        {hasSearch
          ? "No applications match your search."
          : `No applications found in ${scopeLabel}.`}
      </p>
      {!hasSearch && (
        <Button
          primary
          route="/applications/new"
          value="Start New Application"
          className="mt-4 text-[11px]"
        />
      )}
    </section>
  );
}
