"use client";

import { ChartTooltip } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "../lib/types";

interface ListingsChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function ListingsChart({
  data,
  compact = false,
}: ListingsChartProps) {
  const { ref, ready } = useChartReady();
  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className={compact ? "h-56" : "h-60 md:h-72 xl:h-80"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={data}
              margin={compact ? { top: 5, right: 8, left: -20, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="listingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
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
                width={compact ? 34 : 48}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    getTitle={({ label }) => String(label ?? "")}
                    getValueLabel={() => "Listings"}
                  />
                )}
              />
              <Bar
                dataKey="listings"
                fill="url(#listingsGrad)"
                radius={[6, 6, 0, 0]}
                name="Listings"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-muted/20" />
        )}
      </div>
    </div>
  );
}
