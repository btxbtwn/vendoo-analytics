"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VendooListing } from "../lib/types";
import PageSizeSelector from "./ui/PageSizeSelector";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface RecentSalesTableProps {
  sales: VendooListing[];
  compact?: boolean;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  children,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  children?: React.ReactNode;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <p className="text-xs text-[var(--color-text-tertiary)]">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center w-7 h-7 rounded-none border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {pages.map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex items-center justify-center w-7 h-7 text-xs text-[var(--color-text-tertiary)] select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1 rounded-none text-xs font-medium transition-colors ${
                  item === currentPage
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center justify-center w-7 h-7 rounded-none border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

import { PLATFORM_BADGE } from "../lib/platform-colors";

export default function RecentSalesTable({
  sales,
  compact = false,
}: RecentSalesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.max(1, Math.ceil(sales.length / pageSize));
  const start = (page - 1) * pageSize;
  const paginatedSales = sales.slice(start, start + pageSize);

  if (compact) {
    return (
      <div className="w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Sales</h3>
          <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
            Your latest completed transactions
          </p>
        </div>
        <div className="space-y-3">
          {paginatedSales.map((sale, index) => {
 const profit =
 sale.priceSold -
 sale.costOfGoods -
 sale.marketplaceFees -
 sale.shippingExpenses;
 const profitPositive = profit >= 0;

 return (
 <article
 key={`${sale.title}-${index}`}
 className="border-b-[0.5px] border-[color:rgba(255,255,255,0.07)] p-4 transition-colors hover:bg-[var(--color-bg-hover)]"
 >
 <div className="mb-3 flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h4 className="line-clamp-2 text-sm font-medium text-[var(--color-text-primary)]">
 {sale.title}
 </h4>
 <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
 {sale.brand || "Unknown brand"} · {sale.category || "Uncategorized"}
 </p>
 </div>
 <span
    className={`inline-flex shrink-0 items-center rounded-none border px-2.5 py-1 text-[11px] font-medium ${
      PLATFORM_BADGE[sale.soldPlatform] ||
      "bg-muted text-muted-foreground border-border"
    }`}
  >
    {sale.soldPlatform || "Unknown"}
 </span>
 </div>

 <div className="grid grid-cols-3 gap-2 text-sm">
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
 Sold
 </p>
 <p className="mt-1 font-medium text-[var(--color-text-primary)]">
 ${sale.priceSold.toFixed(2)}
 </p>
 </div>
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
 Profit
 </p>
 <p
 className={`mt-1 font-semibold ${
 profitPositive ? "text-success" : "text-danger"
 }`}
 >
 {profitPositive ? "+" : ""}${profit.toFixed(2)}
 </p>
 </div>
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
 Date
 </p>
 <p className="mt-1 text-[var(--color-text-primary)]">
 {new Date(sale.soldDate).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 })}
 </p>
 </div>
 </div>
 </article>
 );
            })}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          >
            <PageSizeSelector
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </Pagination>
        </div>
      );
    }

    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
 <div className="mb-6">
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Sales</h3>
 <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
 Your latest completed transactions
 </p>
 </div>
 <div className="w-full overflow-x-auto">
 <table className="w-full text-sm min-w-[600px]">
 <thead>
 <tr>
 <th className="text-left px-3 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">
 Item
 </th>
 <th className="text-left px-3 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">
 Platform
 </th>
 <th className="text-left px-3 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">
 Sold Date
 </th>
 <th className="text-right px-3 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">
 Sold Price
 </th>
 <th className="text-right px-3 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">
 COGS
 </th>
 <th className="text-right px-3 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">
 Profit
 </th>
 </tr>
 </thead>
              <tbody>
                {paginatedSales.map((sale, i) => {
 const profit =
 sale.priceSold -
 sale.costOfGoods -
 sale.marketplaceFees -
 sale.shippingExpenses;
 const profitPositive = profit >= 0;
 return (
 <tr
 key={i}
 className="border-b-[0.5px] border-[color:rgba(255,255,255,0.07)] last:border-b-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors"
 >
 <td className="px-3 py-2 max-w-[250px]">
 <p className="truncate font-medium text-[var(--color-text-primary)]">
 {sale.title}
 </p>
 <p className="text-xs text-[var(--color-text-tertiary)] truncate">
 {sale.brand} · {sale.category}
 </p>
 </td>
 <td className="px-3 py-2">
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-none text-xs font-medium border ${
      PLATFORM_BADGE[sale.soldPlatform] ||
      "bg-muted text-muted-foreground border-border"
    }`}
  >
    {sale.soldPlatform}
  </span>
 </td>
 <td className="px-3 py-2 text-[var(--color-text-secondary)]">
 {new Date(sale.soldDate).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 })}
 </td>
 <td className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">
 ${sale.priceSold.toFixed(2)}
 </td>
 <td className="px-3 py-2 text-right text-[var(--color-text-secondary)]">
 ${sale.costOfGoods.toFixed(2)}
 </td>
 <td
 className={`px-3 py-2 text-right font-semibold ${
 profitPositive ? "text-success" : "text-danger"
 }`}
 >
 {profitPositive ? "+" : ""}${profit.toFixed(2)}
 </td>
 </tr>
 );
 })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          >
            <PageSizeSelector
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </Pagination>
        </div>
      );
    }
