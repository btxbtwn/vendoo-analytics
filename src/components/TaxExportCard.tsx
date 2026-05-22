"use client";

import { useMemo, useState } from "react";
import { FileText, Download } from "lucide-react";
import { monthlyPnL, inventoryCostSummary } from "../lib/analytics";
import { VendooListing } from "@/lib/types";

interface TaxExportCardProps {
 listings: VendooListing[];
}

function toCSV(rows: string[][]): string {
 return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCSV(filename: string, csv: string) {
 const blob = new Blob([csv], { type: "text/csv" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 a.click();
 URL.revokeObjectURL(url);
}

export default function TaxExportCard({ listings }: TaxExportCardProps) {
 const [selectedYear, setSelectedYear] = useState<string>("all");

 const years = useMemo(() => {
 const set = new Set<number>();
 for (const l of listings) {
 if (l.soldDate) {
 const y = new Date(l.soldDate).getFullYear();
 if (!Number.isNaN(y)) set.add(y);
 }
 }
 return Array.from(set).sort((a, b) => b - a);
 }, [listings]);

 const pnl = useMemo(() => monthlyPnL(listings, "month"), [listings]);

 const filtered = useMemo(() => {
 if (selectedYear === "all") return pnl;
 return pnl.filter((r) => r.month.includes(String(selectedYear)));
 }, [pnl, selectedYear]);

 const totals = useMemo(() => {
 const summary = {
 revenue: 0,
 cogs: 0,
 fees: 0,
 shipping: 0,
 profit: 0,
 };
 for (const r of filtered) {
 summary.revenue += r.revenue;
 summary.cogs += r.cogs;
 summary.fees += r.fees;
 summary.shipping += r.shipping;
 summary.profit += r.profit;
 }
 return summary;
 }, [filtered]);

 const inv = useMemo(() => inventoryCostSummary(listings), [listings]);

 const handleExport = () => {
 const rows: string[][] = [];
 rows.push(["Month", "Revenue", "COGS", "Marketplace Fees", "Shipping", "Net Profit"]);
 for (const r of filtered) {
 rows.push([
 r.month,
 r.revenue.toFixed(2),
 r.cogs.toFixed(2),
 r.fees.toFixed(2),
 r.shipping.toFixed(2),
 r.profit.toFixed(2),
 ]);
 }
 rows.push([]);
 rows.push(["TOTAL", totals.revenue.toFixed(2), totals.cogs.toFixed(2), totals.fees.toFixed(2), totals.shipping.toFixed(2), totals.profit.toFixed(2)]);
 rows.push(["Inventory Value (Active)", inv.activeInventoryCost.toFixed(2)]);
 rows.push(["Inventory ROI", `${inv.inventoryROI}%`]);
 downloadCSV(`schedule_c_${selectedYear}.csv`, toCSV(rows));
 };

 return (
 <div className="surface-card glass-card p-5">
 <div className="mb-5 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
 <FileText size={16} className="text-accent" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-foreground">IRS P&L Export</h3>
 <p className="text-xs text-tertiary">Schedule C ready</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <select
 value={selectedYear}
 onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-none border border-border bg-muted/10 px-2 py-1 text-xs text-foreground outline-none"
 >
 <option value="all">All years</option>
 {years.map((y) => (
 <option key={y} value={y}>{y}</option>
 ))}
 </select>
 <button
 onClick={handleExport}
          className="flex items-center gap-1.5 rounded-none bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
 >
 <Download size={13} />
 Export CSV
 </button>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border-b border-border text-left text-tertiary">
 <th className="pb-2 pr-4 font-medium">Month</th>
 <th className="pb-2 pr-4 text-right font-medium">Revenue</th>
 <th className="pb-2 pr-4 text-right font-medium">COGS</th>
 <th className="pb-2 pr-4 text-right font-medium">Fees</th>
 <th className="pb-2 pr-4 text-right font-medium">Shipping</th>
 <th className="pb-2 text-right font-medium">Net Profit</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((r) => (
 <tr key={r.month} className="border-b border-border/50 text-foreground transition hover:bg-muted/5">
 <td className="py-2 pr-4">{r.month}</td>
 <td className="py-2 pr-4 text-right tabular-nums">${r.revenue.toFixed(2)}</td>
 <td className="py-2 pr-4 text-right tabular-nums">${r.cogs.toFixed(2)}</td>
 <td className="py-2 pr-4 text-right tabular-nums">${r.fees.toFixed(2)}</td>
 <td className="py-2 pr-4 text-right tabular-nums">${r.shipping.toFixed(2)}</td>
 <td className={`py-2 text-right tabular-nums font-medium ${r.profit >= 0 ? "text-success" : "text-danger"}`}>
 ${r.profit.toFixed(2)}
 </td>
 </tr>
 ))}
 <tr className="border-t-2 border-border text-foreground">
 <td className="py-2.5 pr-4 font-semibold">Total</td>
 <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">${totals.revenue.toFixed(2)}</td>
 <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">${totals.cogs.toFixed(2)}</td>
 <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">${totals.fees.toFixed(2)}</td>
 <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">${totals.shipping.toFixed(2)}</td>
 <td className={`py-2.5 text-right font-semibold tabular-nums ${totals.profit >= 0 ? "text-success" : "text-danger"}`}>
 ${totals.profit.toFixed(2)}
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 );
}
