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
  const ready = useChartReady();
  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Listings Over Time
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Monthly new listing activity
        </p>
      </div>
      <div className={compact ? "h-56" : "h-60 md:h-72 xl:h-80"}>
        {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={compact ? { top: 5, right: 8, left: -20, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}
          >
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
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
              name="Listings"
            />
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>
    </div>
  );
}
