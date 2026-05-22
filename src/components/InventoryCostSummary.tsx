"use client";

import { InventoryCostSummary as InventoryCostSummaryType } from "../lib/types";

function fmtCurrency(n: number): string {
 return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
 return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

interface InventoryCostSummaryProps {
 data: InventoryCostSummaryType;
 compact?: boolean;
}

export default function InventoryCostSummary({ data, compact = false }: InventoryCostSummaryProps) {
 const cards = [
 { label: "Total Investment", value: fmtCurrency(data.totalInvestment), sub: `${data.totalCount} items` },
 { label: "Active Inventory Cost", value: fmtCurrency(data.activeInventoryCost), sub: `${data.activeCount} active` },
 { label: "Realized Revenue", value: fmtCurrency(data.realizedRevenue), sub: `${data.soldCount} sold` },
 { label: "Realized Profit", value: fmtCurrency(data.realizedProfit), sub: fmtPct(data.inventoryROI) + " ROI" },
 { label: "Inventory ROI", value: fmtPct(data.inventoryROI), sub: "profit / investment" },
 { label: "STR", value: fmtPct(data.totalCount > 0 ? (data.soldCount / data.totalCount) * 100 : 0), sub: `${data.soldCount} of ${data.totalCount}` },
 ];

 if (compact) {
 return (
 <div className="grid grid-cols-2 gap-3">
 {cards.map((card) => (
 <div key={card.label} className="card border border-border bg-card p-4">
 <dt className="text-xs text-muted-foreground">{card.label}</dt>
 <dd className="mt-1 font-heading text-xl font-bold tabular-nums tracking-tight text-foreground">
 {card.value}
 </dd>
 <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
 {cards.map((card) => (
 <div
 key={card.label}
 className="card border border-border bg-card p-5 md:p-6"
 >
 <dt className="text-xs text-muted-foreground">{card.label}</dt>
 <dd className="mt-2 font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl">
 {card.value}
 </dd>
 <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
 </div>
 ))}
 </div>
 );
}
