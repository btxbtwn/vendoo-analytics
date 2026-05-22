"use client";

import { useState, useMemo } from "react";
import { CategoryBreakdownRow, SortDirection } from "../lib/types";

type SortField = "category" | "listed" | "sold" | "sellThroughRate" | "avgCOGS" | "avgSalePrice" | "avgProfit" | "profitMargin" | "totalRevenue";

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

 function SortIcon({ field }: { field: SortField }) {
 if (field !== sortField) return <span className="text-muted-foreground/30 ml-1">↕</span>;
 return <span className="ml-1 text-accent">{sortDir === "asc" ? "↑" : "↓"}</span>;
 }

 const thClass = "px-3 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors";
 const tdClass = "px-3 py-3 text-sm text-foreground";

 if (sorted.length === 0) {
 return (
 <div className="card w-full border border-border bg-card p-4 md:p-6">
 <h3 className="text-base font-semibold text-foreground">Category Breakdown</h3>
 <p className="mt-0.5 text-xs text-muted-foreground">No listing data available.</p>
 </div>
 );
 }

 if (compact) {
 return (
 <div className="card w-full border border-border bg-card p-4">
 <div className="mb-4">
 <h3 className="text-base font-semibold text-foreground">Category Breakdown</h3>
 <p className="mt-0.5 text-xs text-muted-foreground">COGS, ASP, and profit by category</p>
 </div>
 <div className="space-y-3">
 {sorted.map((row) => (
      <div key={row.category} className="rounded-none border border-border bg-muted/20 p-3">
 <div className="flex items-center justify-between">
 <span className="font-medium text-foreground">{row.category}</span>
 <span className={`text-sm font-bold tabular-nums ${marginColor(row.profitMargin)}`}>
 {fmtPct(row.profitMargin)}
 </span>
 </div>
 <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
 <span>{row.sold}/{row.listed} sold · STR {fmtPct(row.sellThroughRate)}</span>
 <span className="text-right">ASP {fmtCurrency(row.avgSalePrice)}</span>
 <span>Avg COGS {fmtCurrency(row.avgCOGS)}</span>
 <span className="text-right">Avg Profit {fmtCurrency(row.avgProfit)}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="card w-full max-w-full border border-border bg-card p-4 md:p-6">
 <div className="mb-5">
 <h3 className="text-base font-semibold text-foreground">Category Breakdown</h3>
 <p className="mt-0.5 text-xs text-muted-foreground">COGS, ASP, and profit by category</p>
 </div>
 <div className="w-full overflow-x-auto">
 <table className="w-full min-w-[900px] text-sm">
 <thead>
 <tr className="border-b border-border">
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
 {sorted.map((row, i) => (
 <tr
 key={row.category}
 className={`border-b border-border/50 last:border-b-0 transition-all hover:bg-muted/20 ${
 i % 2 === 0 ? "bg-card" : "bg-muted/5"
 }`}
 >
 <td className={`${tdClass} font-medium`}>{row.category}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{row.listed}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{row.sold}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtPct(row.sellThroughRate)}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.avgCOGS)}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.avgSalePrice)}</td>
 <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.avgProfit)}</td>
 <td className={`${tdClass} text-right`}>
 <span
 className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${marginBg(
 row.profitMargin
 )} ${marginColor(row.profitMargin)}`}
 >
 {fmtPct(row.profitMargin)}
 </span>
 </td>
 <td className={`${tdClass} text-right tabular-nums font-medium`}>
 {fmtCurrency(row.totalRevenue)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
