"use client";

import { ChartTooltip, formatCurrency } from "./ChartTooltip";
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

interface BrandChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function BrandChart({
  data,
  compact = false,
}: BrandChartProps) {
  const ready = useChartReady();
  const chartData = compact ? data.slice(0, 6).reverse() : data;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Top Brands by Revenue
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Highest-performing brands in your closet
        </p>
      </div>
      <div className={compact ? "h-[18rem]" : "h-80 md:h-96"}>
        {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={compact ? { top: 5, right: 8, left: -10, bottom: 5 } : { top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 11 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
              width={compact ? 72 : 90}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  getTitle={({ payload }) => String(payload[0]?.payload?.name ?? "")}
                  getValueLabel={() => "Revenue"}
                  valueFormatter={formatCurrency}
                />
              )}
            />
            <Bar
              dataKey="revenue"
              fill="#6366f1"
              radius={[0, 6, 6, 0]}
              name="Revenue"
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
