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
  Cell,
} from "recharts";

interface ProfitBreakdownChartProps {
  data: { name: string; value: number }[];
  compact?: boolean;
}

const FILL_COLORS = ["#d4943a", "#c45a4a", "#d4a63a", "#6db37a", "#7a7068"];

export default function ProfitBreakdownChart({
  data,
  compact = false,
}: ProfitBreakdownChartProps) {
  const ready = useChartReady();

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Profit Breakdown
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue, costs, and net profit composition
        </p>
      </div>
      {ready && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<ChartTooltip valueFormatter={(v) => formatCurrency(Number(v))} />}
              cursor={{ fill: "var(--color-muted)", opacity: 0.1 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={FILL_COLORS[index % FILL_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
          No data available
        </div>
      )}
    </div>
  );
}
