"use client";

import { ReactNode, useState, useMemo } from "react";
import { SkeletonTable } from "./LoadingSkeleton";

export type SortDirection = "asc" | "desc";

export interface ColumnConfig<T> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  numeric?: boolean;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  keyField: keyof T;
  caption?: string;
  emptyMessage?: string;
  loading?: boolean;
  compact?: boolean;
  defaultSortField?: string;
  defaultSortDir?: SortDirection;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onSort?: (field: string, dir: SortDirection) => void;
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

function SortIcon({ active, dir }: { active: boolean; dir: SortDirection }) {
  if (!active) return <span className="text-[var(--color-text-tertiary)] opacity-30 ml-1">↕</span>;
  return <span className="ml-1 text-[var(--color-accent)]">{dir === "asc" ? "↑" : "↓"}</span>;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  caption,
  emptyMessage = "No data available.",
  loading = false,
  compact = false,
  defaultSortField,
  defaultSortDir = "desc",
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  defaultPageSize = 10,
  onSort,
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string>(defaultSortField ?? "");
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSortDir);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  function handleSort(field: string) {
    const col = columns.find((c) => c.key === field);
    if (!col?.sortable) return;

    if (field === sortField) {
      const next = sortDir === "asc" ? "desc" : "asc";
      setSortDir(next);
      onSort?.(field, next);
    } else {
      setSortField(field);
      setSortDir("desc");
      onSort?.(field, "desc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortField) return data;
    const col = columns.find((c) => c.key === sortField);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [data, sortField, sortDir, columns]);

  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  // Reset to page 0 when pageSize changes
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(0);
  }

  // Build page number buttons (show window around current)
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | "...")[] = [0];
    if (page > 2) pages.push("...");
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);
    return pages;
  }

  const pad = compact ? "p-2" : "p-3";
  const textSize = compact ? "text-xs" : "text-sm";

  const thBase = `${pad} text-left ${textSize} font-medium uppercase tracking-wide text-[var(--color-text-tertiary)] border-b border-[var(--color-border)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors`;
  const tdBase = `${pad} ${textSize} text-[var(--color-text-primary)]`;

  if (loading) {
    return <SkeletonTable rows={pageSize} />;
  }

  if (data.length === 0) {
    return (
      <div className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-6">
        {caption && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{caption}</h3>
          </div>
        )}
        <p className="text-sm text-[var(--color-text-tertiary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none overflow-hidden">
      {caption && (
        <div className={`${pad} border-b border-[var(--color-border)]`}>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{caption}</h3>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="sticky top-0 z-10 bg-[var(--color-bg-surface)]">
            <tr>
              {columns.map((col) => {
                const isActive = col.key === sortField;
                const alignClass = col.numeric ? `${thBase} text-right` : thBase;
                return (
                  <th
                    key={col.key}
                    className={`${alignClass} ${col.sortable ? "" : "cursor-default"} ${col.className ?? ""}`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    {col.header}
                    {col.sortable !== false && <SortIcon active={isActive} dir={sortDir} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={String(row[keyField])}
                className="border-b border-[var(--color-border)] last:border-b-0 transition-colors hover:bg-[var(--color-bg-hover)]"
              >
                {columns.map((col) => {
                  const value = col.accessor ? col.accessor(row) : String((row as Record<string, unknown>)[col.key] ?? "");
                  return (
                    <td
                      key={col.key}
                      className={`${tdBase} ${col.numeric ? "text-right tabular-nums" : ""} ${col.className ?? ""}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`${pad} flex items-center justify-between gap-4 border-t border-[var(--color-border)]`}>
        <p className={`text-xs text-[var(--color-text-tertiary)]`}>
          Showing {sorted.length === 0 ? 0 : page * pageSize + 1}–
          {Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
        </p>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-tertiary)]">Show</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-none border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]/50 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs text-[var(--color-text-tertiary)]">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`min-w-[28px] py-1 text-xs transition-colors ${
                    page === p
                      ? "text-[var(--color-accent)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {(p as number) + 1}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
