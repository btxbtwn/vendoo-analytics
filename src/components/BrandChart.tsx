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
  const { ref, ready } = useChartReady();
  const chartData = compact ? data.slice(0, 6).reverse() : data;

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className={compact ? "h-[18rem]" : "h-80 md:h-96"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={compact ? { top: 5, right: 8, left: -10, bottom: 5 } : { top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
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
                fill="var(--chart-1)"
                radius={[0, 6, 6, 0]}
                name="Revenue"
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
