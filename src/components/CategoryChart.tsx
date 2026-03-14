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
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#22c55e", "#4ade80", "#86efac",
  "#f97316", "#fb923c", "#fdba74",
  "#ec4899", "#f472b6", "#f9a8d4",
  "#06b6d4", "#22d3ee", "#67e8f9",
  "#eab308", "#facc15", "#fde047",
];

interface CategoryChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function CategoryChart({
  data,
  compact = false,
}: CategoryChartProps) {
  const ready = useChartReady();
  const topCategories = data.slice(0, compact ? 5 : 10);
  const otherRevenue = data
    .slice(compact ? 5 : 10)
    .reduce((sum, item) => sum + Number(item.revenue ?? item.value), 0);
  const displayData = otherRevenue > 0
    ? [...topCategories, { name: "Other", value: otherRevenue, revenue: otherRevenue, profit: 0, sales: 0 }]
    : topCategories;
  const totalRevenue = displayData.reduce((sum, item) => sum + Number(item.revenue ?? item.value), 0);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sales by Category</h3>
        <p className="mt-1 text-sm text-muted-foreground">Revenue distribution across your strongest categories</p>
      </div>

      {displayData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No category sales matched the selected range.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a broader filter to repopulate the chart.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${compact ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_minmax(15rem,0.95fr)] xl:items-center"}`}>
          <div className={compact ? "h-72" : "h-64 md:h-72 xl:h-[22rem]"}>
            {ready ? (
              <ResponsiveContainer width="100%" height="100%">
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
              <div className="h-full rounded-2xl bg-muted/20" />
            )}
          </div>

          <div className={`grid gap-2 ${compact ? "sm:grid-cols-2" : "grid-cols-1"}`}>
            {displayData.map((item, index) => {
              const revenue = Number(item.revenue ?? item.value);
              const share = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

              return (
                <div
                  key={item.name}
                  className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
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
