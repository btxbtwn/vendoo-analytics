"use client";

import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartDataPoint } from "../lib/types";

const CATEGORY_COLORS = [
  "var(--chart-1)", "var(--chart-5)", "var(--chart-5)", "var(--chart-5)",
  "var(--chart-2)", "var(--chart-8)", "var(--chart-8)",
  "var(--chart-7)", "var(--chart-7)", "var(--chart-7)",
  "var(--chart-5)", "var(--chart-5)", "var(--chart-5)",
  "var(--chart-6)", "var(--chart-6)", "var(--chart-6)",
  "var(--chart-3)", "var(--chart-3)", "var(--chart-3)",
];

interface CategoryChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function CategoryChart({
  data,
  compact = false,
}: CategoryChartProps) {
  const { ref, ready } = useChartReady();
  const topCategories = data.slice(0, compact ? 5 : 10);
  const otherRevenue = data
    .slice(compact ? 5 : 10)
    .reduce((sum, item) => sum + Number(item.revenue ?? item.value), 0);
  const displayData = otherRevenue > 0
    ? [...topCategories, { name: "Other", value: otherRevenue, revenue: otherRevenue, profit: 0, sales: 0 }]
    : topCategories;
  const totalRevenue = displayData.reduce((sum, item) => sum + Number(item.revenue ?? item.value), 0);

  return (
    <div className="w-full max-w-full overflow-hidden border border-[var(--color-border)] rounded-none bg-transparent p-4 md:p-6">
      {displayData.length === 0 ? (
        <div className="border border-dashed border-border bg-muted/10 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No category sales matched the selected range.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a broader filter to repopulate the chart.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${compact ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_minmax(15rem,0.95fr)] xl:items-center"}`}>
          <div ref={ref} className={compact ? "h-72" : "h-64 md:h-72 xl:h-[22rem]"}>
            {ready ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={compact ? 46 : 64}
                    outerRadius={compact ? 82 : 112}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {displayData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-muted/20" />
            )}
          </div>

          <div className={`grid gap-2 ${compact ? "sm:grid-cols-2" : "grid-cols-1"}`}>
            {displayData.map((item, index) => {
              const revenue = Number(item.revenue ?? item.value);
              const share = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

              return (
                <div
                  key={item.name}
                  className="border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-none"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      />
                      <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="tabular-nums text-sm font-medium text-foreground">{formatCurrency(revenue)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{share.toFixed(1)}% of category revenue</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
