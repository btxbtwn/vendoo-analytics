"use client";

import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
    .reduce((s, d) => s + (d.revenue as number), 0);
  const displayData =
    otherRevenue > 0
      ? [...topCategories, { name: "Other", value: otherRevenue, revenue: otherRevenue, profit: 0, sales: 0 }]
      : topCategories;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Sales by Category
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue distribution across product categories
        </p>
      </div>
      <div className={compact ? "h-72" : "h-64 md:h-80"}>
        {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={compact ? 45 : 60}
              outerRadius={compact ? 76 : 110}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
            >
              {displayData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
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
            <Legend
              wrapperStyle={{ fontSize: compact ? "0.65rem" : "0.7rem", color: "#a1a1aa" }}
              layout={compact ? "horizontal" : "vertical"}
              align={compact ? "center" : "right"}
              verticalAlign={compact ? "bottom" : "middle"}
            />
          </PieChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>
    </div>
  );
}
