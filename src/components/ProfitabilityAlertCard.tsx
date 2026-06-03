"use client";

import { AlertTriangle, TrendingDown } from "lucide-react";
import { profitDistribution } from "../lib/analytics";
import { VendooListing } from "@/lib/types";

interface ProfitabilityAlertCardProps {
 listings: VendooListing[];
}

function classForMargin(margin: number): string {
 if (margin >= 0.3) return "text-success";
 if (margin >= 0.15) return "text-warning";
 return "text-danger";
}

export default function ProfitabilityAlertCard({ listings }: ProfitabilityAlertCardProps) {
 const allListings = listings;
 const soldListings = allListings.filter((l) => l.status === "Sold" && l.priceSold > 0);

 // Loss leaders: negative or zero profit
 const lossLeaders = soldListings
 .map((l) => ({
 title: l.title,
 brand: l.brand,
 category: l.category,
 priceSold: l.priceSold,
 cost: l.costOfGoods + l.marketplaceFees + l.shippingExpenses,
 profit: l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses,
 margin: l.priceSold > 0
 ? (l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses) / l.priceSold
 : 0,
 }))
 .filter((l) => l.profit <= 0)
 .sort((a, b) => a.profit - b.profit)
 .slice(0, 5);

 // Category margin map
 const catMap = new Map<string, { profit: number; revenue: number; count: number }>();
 for (const l of soldListings) {
 const cat = l.category || "Unknown";
 const profit = l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses;
 const prev = catMap.get(cat) || { profit: 0, revenue: 0, count: 0 };
 prev.profit += profit;
 prev.revenue += l.priceSold;
 prev.count += 1;
 catMap.set(cat, prev);
 }
 const lowMarginCats = Array.from(catMap.entries())
 .map(([category, v]) => ({
 category,
 avgMargin: v.revenue > 0 ? v.profit / v.revenue : 0,
 revenue: v.revenue,
 count: v.count,
 }))
 .sort((a, b) => a.avgMargin - b.avgMargin)
 .filter((c) => c.avgMargin < 0.15)
 .slice(0, 4);

 // Profit distribution buckets
 const dist = profitDistribution(soldListings);
 const itemsUnder5 = (dist.find((d) => d.bucket === "$0\u20135")?.count ?? 0) + (dist.find((d) => d.bucket === "\u003c $0")?.count ?? 0);

 const hasAlerts = lossLeaders.length > 0 || lowMarginCats.length > 0 || itemsUnder5 > 0;

  return (
    <div className="surface-card glass-card rounded-none p-5">
 <div className="mb-5 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-none bg-danger/10">
 <AlertTriangle size={16} className="text-danger" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-foreground">Profitability Alerts</h3>
 <p className="text-xs text-tertiary">Issues that need attention</p>
 </div>
 </div>
 {!hasAlerts ? (
 <span className="rounded-none bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">Healthy</span>
 ) : null}
 </div>

 {/* Loss Leaders */}
 {lossLeaders.length > 0 && (
 <div className="mb-5">
 <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-danger">
 <TrendingDown size={12} /> Loss Leaders &mdash; {lossLeaders.length} items
 </p>
 <div className="space-y-2">
 {lossLeaders.map((l) => (
 <div
 key={l.title}
                className="flex items-center justify-between rounded-none border border-danger/20 bg-danger/5 px-3 py-2.5"
 >
 <div className="min-w-0">
 <p className="truncate text-xs font-medium text-foreground">{l.title}</p>
 <p className="text-[10px] text-tertiary">{l.brand || l.category || "Unknown"}</p>
 </div>
 <div className="text-right">
 <p className={`text-sm font-bold tabular-nums ${classForMargin(l.margin)}`}>
 ${l.profit.toFixed(2)}
 </p>
 <p className="text-[10px] text-tertiary tabular-nums">{(l.margin * 100).toFixed(0)}% margin</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Low Margin Categories */}
 {lowMarginCats.length > 0 && (
 <div className="mb-5">
 <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-warning">
 Low Margin Categories
 </p>
 <div className="space-y-2">
 {lowMarginCats.map((c) => (
 <div
 key={c.category}
                className="flex items-center justify-between rounded-none border border-warning/20 bg-warning/5 px-3 py-2"
 >
 <div>
 <p className="text-xs font-medium text-foreground">{c.category}</p>
 <p className="text-[10px] text-tertiary">{c.count} sold</p>
 </div>
 <p className={`text-sm font-bold tabular-nums ${classForMargin(c.avgMargin)}`}>
 {(c.avgMargin * 100).toFixed(1)}%
 </p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Thin profit summary */}
 {itemsUnder5 > 0 && (
    <div className="rounded-none border border-warning/20 bg-warning/5 px-3 py-2.5 text-xs text-warning">
 <span className="font-semibold">{itemsUnder5}</span> items sold for under $5 profit or a loss
 </div>
 )}

 {!hasAlerts && (
 <div className="flex items-center justify-center py-6 text-xs text-secondary">
 All items have healthy margins.
 </div>
 )}
 </div>
 );
}
