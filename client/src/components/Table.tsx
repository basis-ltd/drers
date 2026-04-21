import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import Button from "@/components/Button";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface TableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pagination?: TablePaginationProps;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
}

export function Table<TData>({
  columns,
  data,
  pagination,
  isLoading = false,
  loadingRows = 5,
  emptyState,
}: TableProps<TData>) {
  // TanStack table returns function-rich objects that React Compiler intentionally skips.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;
  const canGoPrevious = pagination ? pagination.page > 1 : false;
  const canGoNext = pagination ? pagination.page < totalPages : false;

  return (
    <article className="overflow-hidden rounded-md bg-white shadow-sm">
      {isLoading ? (
        <section className="space-y-px p-4">
          {Array.from({ length: loadingRows }).map((_, i) => (
            <span
              key={i}
              className="block h-12 w-full animate-pulse rounded-md bg-primary/5"
            />
          ))}
        </section>
      ) : data.length === 0 ? (
        (emptyState ?? (
          <section className="py-16 text-center text-[12px] text-primary/45">
            No records found.
          </section>
        ))
      ) : (
        <>
          <section className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-primary/8 bg-background"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-5 py-3 text-left text-[12px]! font-medium text-primary/80 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`group transition-colors hover:bg-background ${i === table.getRowModel().rows.length - 1 ? "" : "border-b border-primary/6"}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-5 text-[11px]! py-3.5 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {pagination && totalPages > 1 && (
            <footer className="flex items-center justify-between border-t border-primary/8 bg-background/40 px-4 py-3">
              <p className="text-[11px] text-primary/50">
                Page {pagination.page} of {totalPages}
              </p>
              <section className="flex items-center gap-2">
                <Button
                  value="Previous"
                  disabled={!canGoPrevious}
                  onClick={() =>
                    canGoPrevious &&
                    pagination.onPageChange(Math.max(1, pagination.page - 1))
                  }
                  className="h-8 px-3 text-[11px]!"
                />
                <Button
                  value="Next"
                  disabled={!canGoNext}
                  onClick={() =>
                    canGoNext &&
                    pagination.onPageChange(
                      Math.min(totalPages, pagination.page + 1),
                    )
                  }
                  className="h-8 px-3 text-[11px]!"
                />
              </section>
            </footer>
          )}
        </>
      )}
    </article>
  );
}
