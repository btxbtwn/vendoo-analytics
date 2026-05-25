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
  const { ref, ready } = useChartReady();

  return (
    <div
      className="bg-transparent border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 md:p-6 w-full max-w-full overflow-hidden"
      style={{
        animation: 'chartEntrance 400ms ease-out forwards',
      }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Profit
        </span>
      </div>
      <div ref={ref} className={compact ? "h-56 sm:h-64" : "h-64 md:h-80 xl:h-[26rem]"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={data}
              margin={compact ? { top: 8, right: 8, left: -24, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                minTickGap={compact ? 24 : 12}
              />
              <YAxis
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="var(--chart-1)"
                fillOpacity={0.1}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="var(--chart-2)"
                fillOpacity={0.1}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-muted/20" />
        )}
      </div>
    </div>
  );
}
