"use client";

import { useMemo, useState } from "react";

import { filterListingsByDate, topBrands } from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import BrandChart from "../BrandChart";
import TabDateFilterBar from "../TabDateFilterBar";
import PageSizeSelector from "../ui/PageSizeSelector";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface BrandsPanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

export default function BrandsPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: BrandsPanelProps) {
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((listing) => listing.status === "Sold"), "soldDate", filter),
    [filter, listings],
  );
  const topBrandData = useMemo(
    () => topBrands(soldListings, compact ? 8 : 20),
    [compact, soldListings],
  );
  const allBrandRows = useMemo(
    () => topBrands(soldListings, 200),
    [soldListings],
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(allBrandRows.length / pageSize));
  const paginatedRows = allBrandRows.slice((page - 1) * pageSize, page * pageSize);

  function renderBrandRows() {
    if (compact) {
      return (
        <div className="space-y-3">
          {paginatedRows.map((brand) => (
            <div
              key={brand.name}
              className="rounded-none border border-border/70 bg-muted/20 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-foreground">
                    {brand.name}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(brand.sales as number)} sales
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  ${(brand.profit as number).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium text-foreground">
                  ${(brand.revenue as number).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Brand
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sales
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Revenue
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Profit
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((brand) => (
              <tr
                key={brand.name}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-2 font-medium text-foreground">
                  {brand.name}
                </td>
                <td className="py-3 px-2 text-right text-muted-foreground">
                  {brand.sales as number}
                </td>
                <td className="py-3 px-2 text-right text-foreground font-medium">
                  ${(brand.revenue as number).toFixed(2)}
                </td>
                <td
                  className={`py-3 px-2 text-right font-semibold ${
                    (brand.profit as number) >= 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  ${(brand.profit as number).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
        filter={filter}
        onFilterChange={onFilterChange}
      />
      {/* Top Brands Chart */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Top Brands
        </h2>
        <BrandChart data={topBrandData} compact={compact} />
      </div>
      {/* Brand Performance Table */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Brand Performance in Range
        </h2>
        {renderBrandRows()}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-none border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-primary)] disabled:opacity-30 hover:border-[var(--color-accent)]/50 transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : page < 4 ? i + 1 : page > totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-none border px-3 py-1 text-xs transition-colors ${
                        page === p
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-none border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-primary)] disabled:opacity-30 hover:border-[var(--color-accent)]/50 transition-colors"
                >
                  Next →
                </button>
              </div>
              <PageSizeSelector
                value={pageSize}
                options={PAGE_SIZE_OPTIONS}
                onChange={(size) => { setPageSize(size); setPage(1); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
