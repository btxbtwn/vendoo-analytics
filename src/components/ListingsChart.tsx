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
    <div className="bg-transparent border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className={compact ? "h-56" : "h-60 md:h-72 xl:h-80"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={data}
              margin={compact ? { top: 5, right: 8, left: -20, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}
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
                fill="var(--chart-5)"
                radius={[4, 4, 0, 0]}
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
