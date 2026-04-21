import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Table } from "@/components/Table";
import { useListApplicationsQuery } from "@/features/applications/api/applicationsApi";
import type {
  Application,
  ApplicationStatus,
} from "@/features/applications/api/types";
import { faFile, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import CustomPopover from "@/components/CustomPopover";
import {
  TableActionButton,
  TableActionButtonTrigger,
} from "@/components/TableActionButton";
import { capitalizeString, formatDate } from "@/utils/strings.utils";

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
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
    label: "Conditional",
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

type FilterKey = "ALL" | "DRAFT" | "UNDER_REVIEW" | "QUERY_RAISED" | "APPROVED";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All Applications" },
  { key: "DRAFT", label: "Drafts" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "QUERY_RAISED", label: "Queries" },
  { key: "APPROVED", label: "Approved" },
];

export function MyApplicationsPage() {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useListApplicationsQuery({
    status: filter === "ALL" ? undefined : (filter as ApplicationStatus),
    page,
    limit: PAGE_SIZE,
  });

  const applications = data?.data ?? [];

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
                {["DRAFT"].includes(row.original.status) && (
                  <TableActionButton
                    to={`/applications/${row.original.id}/edit`}
                    label="Continue"
                    icon={faPenToSquare}
                  />
                )}
                {["APPROVED"].includes(row.original.status) && (
                  <TableActionButton
                    to={`/applications/${row.original.id}/certificate`}
                    label="Certificate"
                  />
                )}
                {["QUERY_RAISED"].includes(row.original.status) && (
                  <TableActionButton
                    to={`/applications/${row.original.id}/respond`}
                    label="Respond"
                  />
                )}
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [],
  );

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
        <nav
          aria-label="Status filters"
          className="flex flex-wrap gap-1 rounded-md border border-primary/10 bg-white p-1"
        >
          {FILTERS.map(({ key, label }) => (
            <Link
              key={key}
              onClick={(e) => {
                e.preventDefault();
                setFilter(key);
                setPage(1);
              }}
              to="#"
              className={`rounded-md px-3.5 py-1.5 text-[11px]! font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-primary/50 hover:bg-primary/6 hover:text-primary"
              }`}
            >
              {capitalizeString(label)}
              {key !== "ALL" && data && (
                <span
                  className={`ml-1.5 opacity-60 ${filter === key ? "text-white!" : "text-primary/50"}`}
                >
                  (
                  {
                    data?.data?.filter((a: Application) => a?.status === key)
                      ?.length
                  }
                  )
                </span>
              )}
            </Link>
          ))}
        </nav>

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
        isLoading={isLoading}
        emptyState={<EmptyState hasSearch={!!search} />}
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

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
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
          : "No applications yet."}
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
