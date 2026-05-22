"use client";

import { useMemo } from "react";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Legend,
} from "recharts";
import { formatPeriodLabel, parseListingDate, getListingProfit, formatDayKey, startOfDay, addDays, endOfDay } from "../lib/analytics";
import type { TimeGrouping, VendooListing } from "../lib/types";
import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

interface PeriodComparisonChartProps {
 currentData: { name: string; revenue: number; profit: number }[];
 previousData: { name: string; revenue: number; profit: number }[];
 compact?: boolean;
}

export default function PeriodComparisonChart({
 currentData,
 previousData,
 compact = false,
}: PeriodComparisonChartProps) {
 const ready = useChartReady();

 /* merge current + previous by name */
 const merged = useMemo(() => {
 const map = new Map<string, { name: string; revenue: number; profit: number; prevRevenue: number | null; prevProfit: number | null }>();
 for (const d of currentData) {
 map.set(d.name, { name: d.name, revenue: d.revenue, profit: d.profit, prevRevenue: null, prevProfit: null });
 }
 for (const d of previousData) {
 const existing = map.get(d.name);
 if (existing) {
 existing.prevRevenue = d.revenue;
 existing.prevProfit = d.profit;
 } else {
 map.set(d.name, { name: d.name, revenue: 0, profit: 0, prevRevenue: d.revenue, prevProfit: d.profit });
 }
 }
 return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
 }, [currentData, previousData]);

 const totals = useMemo(() => {
 const curRev = currentData.reduce((s, d) => s + d.revenue, 0);
 const curProf = currentData.reduce((s, d) => s + d.profit, 0);
 const prevRev = previousData.reduce((s, d) => s + d.revenue, 0);
 const prevProf = previousData.reduce((s, d) => s + d.profit, 0);
 const revDelta = prevRev > 0 ? round(((curRev - prevRev) / prevRev) * 100, 1) : 0;
 const profDelta = prevProf > 0 ? round(((curProf - prevProf) / prevProf) * 100, 1) : 0;
 return { curRev, curProf, prevRev, prevProf, revDelta, profDelta };
 }, [currentData, previousData]);

 if (!currentData.length && !previousData.length) return null;

 return (
 <div className="surface-card glass-card p-4 md:p-6">
 {/* Header */}
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-semibold text-foreground">Period Comparison</h3>
 <p className="text-sm text-muted-foreground">Current vs Previous Period</p>
 </div>
 <div className="flex gap-3">
 <DeltaBadge label="Revenue" delta={totals.revDelta} />
 <DeltaBadge label="Profit" delta={totals.profDelta} />
 </div>
 </div>

 <div className={compact ? "h-56 sm:h-64" : "h-64 md:h-80 xl:h-[26rem]"}>
 {ready ? (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={merged} margin={compact ? { top: 8, right: 8, left: -24, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}>
 <defs>
 <linearGradient id="currRevFill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
 <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="currProfFill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
 <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
 <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }} axisLine={{ stroke: "#27272a" }} tickLine={false} />
 <YAxis tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }} axisLine={{ stroke: "#27272a" }} tickLine={false} tickFormatter={(v) => `$${v}`} width={compact ? 40 : 56} />
 <Tooltip
 cursor={{ fill: "transparent" }}
 content={(props) => (
 <ChartTooltip
 {...props}
 getTitle={({ label }) => String(label ?? "")}
 valueFormatter={formatCurrency}
 />
 )}
 />
 {<Legend wrapperStyle={{ fontSize: "0.75rem", color: "#a1a1aa" }} />}
 <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#currRevFill)" name="Revenue (curr)" />
 <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="url(#currProfFill)" name="Profit (curr)" />
 <Area type="monotone" dataKey="prevRevenue" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 4" fill="none" name="Revenue (prev)" />
 <Area type="monotone" dataKey="prevProfit" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4" fill="none" name="Profit (prev)" />
 </AreaChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-full bg-muted/20" />
 )}
 </div>
 </div>
 );
}

function DeltaBadge({ label, delta }: { label: string; delta: number }) {
 const positive = delta >= 0;
 return (
  <div className={`flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-[11px] font-medium ${positive ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}`}>
 <span>{positive ? "▲" : "▼"}</span>
 <span>{label}: {delta > 0 ? "+" : ""}{delta}%</span>
 </div>
 );
}

function round(n: number, d = 2): number {
 return Math.round(n * 10 ** d) / 10 ** d;
}
