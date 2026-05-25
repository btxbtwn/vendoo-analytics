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

const FILL_COLORS = ["var(--chart-1)", "var(--chart-4)", "var(--chart-3)", "var(--chart-2)", "var(--color-text-tertiary)"];

export default function ProfitBreakdownChart({
  data,
  compact = false,
}: ProfitBreakdownChartProps) {
  const { ref, ready } = useChartReady();

  return (
    <div ref={ref} className="bg-transparent border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 md:p-6 w-full max-w-full overflow-hidden">
      {ready && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
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
