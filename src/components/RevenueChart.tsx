"use client";

import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

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
import { ChartDataPoint } from "../lib/types";

interface RevenueChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function RevenueChart({
  data,
  compact = false,
}: RevenueChartProps) {
  const ready = useChartReady();

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Revenue &amp; Profit Over Time
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Performance across the selected date range</p>
      </div>
      {compact && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" /> Revenue
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" /> Profit
          </span>
        </div>
      )}
      <div className={compact ? "h-56 sm:h-64" : "h-64 md:h-80 xl:h-[26rem]"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={compact ? { top: 8, right: 8, left: -24, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                minTickGap={compact ? 24 : 12}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
                width={compact ? 40 : 56}
              />
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
              {!compact && (
                <Legend wrapperStyle={{ fontSize: "0.75rem", color: "#a1a1aa" }} />
              )}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradientRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#gradientProfit)"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>
    </div>
  );
}
