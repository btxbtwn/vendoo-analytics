"use client";

import { useState, useMemo } from "react";
import { CategoryBreakdownRow, SortDirection } from "../lib/types";
import { Badge } from "./ui/Badge";
import PageSizeSelector from "./ui/PageSizeSelector";

type SortField = "category" | "listed" | "sold" | "sellThroughRate" | "avgCOGS" | "avgSalePrice" | "avgProfit" | "profitMargin" | "totalRevenue";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function fmtCurrency(n: number): string {
 return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
 return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

function marginColor(margin: number): string {
 if (margin >= 30) return "text-success";
 if (margin >= 10) return "text-warning";
 return "text-danger";
}

function marginBg(margin: number): string {
 if (margin >= 30) return "bg-success/10";
 if (margin >= 10) return "bg-warning/10";
 return "bg-danger/10";
}

interface CategoryBreakdownTableProps {
 data: CategoryBreakdownRow[];
 compact?: boolean;
}

export default function CategoryBreakdownTable({ data, compact = false }: CategoryBreakdownTableProps) {
 const [sortField, setSortField] = useState<SortField>("totalRevenue");
 const [sortDir, setSortDir] = useState<SortDirection>("desc");
 const [page, setPage] = useState(0);
 const [pageSize, setPageSize] = useState(5);

 function handleSort(field: SortField) {
 if (field === sortField) {
 setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 } else {
 setSortField(field);
 setSortDir("desc");
 }
 }

 const sorted = useMemo(() => {
 return [...data].sort((a, b) => {
 const av = a[sortField];
 const bv = b[sortField];
 if (typeof av === "string" && typeof bv === "string") {
 return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
 }
 return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
 });
 }, [data, sortField, sortDir]);

 const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);
 const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

 function SortIcon({ field }: { field: SortField }) {
 if (field !== sortField) return <span className="text-[var(--color-text-tertiary)]/30 ml-1">↕</span>;
 return <span className="ml-1 text-[var(--color-accent)]">{sortDir === "asc" ? "↑" : "↓"}</span>;
 }

 const thClass = "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors";
 const tdClass = "px-3 py-2 text-sm text-[var(--color-text-primary)]";

 if (sorted.length === 0) {
 return (
 <div className="w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-4 md:p-6">
 <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Category Breakdown</h3>
 <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">No listing data available.</p>
 </div>
 );
 }

 if (compact) {
 return (
 <div className="w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-4">
 <div className="mb-4">
 <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Category Breakdown</h3>
 <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">COGS, ASP, and profit by category</p>
 </div>
 <div className="space-y-3">
 {pageRows.map((row) => (
     <div key={row.category} className="border-b-[0.5px] border-[color:rgba(255,255,255,0.07)] p-3 transition-colors hover:bg-[var(--color-bg-hover)]">
 <div className="flex items-center justify-between">
 <span className="font-medium text-[var(--color-text-primary)]">{row.category}</span>
 <span className={`text-sm font-bold tabular-nums ${marginColor(row.profitMargin)}`}>
 {fmtPct(row.profitMargin)}
 </span>
 </div>
 <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
 <span>{row.sold}/{row.listed} sold · STR {fmtPct(row.sellThroughRate)}</span>
 <span className="text-right">ASP {fmtCurrency(row.avgSalePrice)}</span>
 <span>Avg COGS {fmtCurrency(row.avgCOGS)}</span>
 <span className="text-right">Avg Profit {fmtCurrency(row.avgProfit)}</span>
 </div>
 </div>
 ))}
 </div>
 <div className="flex items-center justify-between mt-4">
   <p className="text-xs text-[var(--color-text-tertiary)]">
     Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
   </p>
   <PageSizeSelector
     value={pageSize}
     options={PAGE_SIZE_OPTIONS}
     onChange={(size) => { setPageSize(size); setPage(0); }}
   />
 </div>
 </div>
 );
 }

 return (
 <div className="w-full max-w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-4 md:p-6">
 <div className="mb-5">
 <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Category Breakdown</h3>
 <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">COGS, ASP, and profit by category</p>
 </div>
 <div className="w-full overflow-x-auto">
 <table className="w-full min-w-[900px] text-sm">
 <thead>
 <tr>
 <th className={thClass} onClick={() => handleSort("category")}>
 Category <SortIcon field="category" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("listed")}>
 Items <SortIcon field="listed" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("sold")}>
 Sold <SortIcon field="sold" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("sellThroughRate")}>
 STR <SortIcon field="sellThroughRate" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("avgCOGS")}>
 Avg COGS <SortIcon field="avgCOGS" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("avgSalePrice")}>
 Avg ASP <SortIcon field="avgSalePrice" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("avgProfit")}>
 Avg Profit <SortIcon field="avgProfit" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("profitMargin")}>
 Margin <SortIcon field="profitMargin" />
 </th>
 <th className={`${thClass} text-right`} onClick={() => handleSort("totalRevenue")}>
 Revenue <SortIcon field="totalRevenue" />
 </th>
 </tr>
 </thead>
 <tbody>
 {pageRows.map((row, i) => (
 <tr
 key={row.category}
 className="border-b-[0.5px] border-[color:rgba(255,255,255,0.07)] last:border-b-0 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
 >
 <td className={`${tdClass} font-medium`}>{row.category}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{row.listed}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{row.sold}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtPct(row.sellThroughRate)}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.avgCOGS)}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.avgSalePrice)}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.avgProfit)}</td>
 <td className={`${tdClass} text-right`}>
 <Badge
 variant={row.profitMargin >= 30 ? "success" : row.profitMargin >= 10 ? "warning" : "danger"}
 >
 {fmtPct(row.profitMargin)}
 </Badge>
 </td>
 <td className={`${tdClass} text-right tabular-nums font-medium`}>
 {fmtCurrency(row.totalRevenue)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="flex items-center justify-between mt-4">
   <p className="text-xs text-[var(--color-text-tertiary)]">
     Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
   </p>
   <PageSizeSelector
     value={pageSize}
     options={PAGE_SIZE_OPTIONS}
     onChange={(size) => { setPageSize(size); setPage(0); }}
   />
 </div>
 </div>
 );
}
