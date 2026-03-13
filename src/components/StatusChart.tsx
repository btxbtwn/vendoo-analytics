"use client";

import { ChartTooltip } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartDataPoint } from "../lib/types";

const STATUS_COLORS: Record<string, string> = {
  Active: "#6366f1",
  Sold: "#22c55e",
  Draft: "#a1a1aa",
};

interface StatusChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function StatusChart({
  data,
  compact = false,
}: StatusChartProps) {
  const ready = useChartReady();
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Inventory Status
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Current listing status distribution
        </p>
      </div>
      <div className={compact ? "h-48" : "h-56 md:h-64"}>
        {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={compact ? 40 : 50}
              outerRadius={compact ? 68 : 80}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || "#6366f1"}
                />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  getTitle={({ payload }) => String(payload[0]?.payload?.name ?? "")}
                  getValueLabel={() => "Listings"}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>
      <div className={`mt-2 grid ${compact ? "grid-cols-3 gap-2" : "grid-cols-3 gap-4 md:px-6"}`}>
        {data.map((item) => (
          <div key={item.name} className="rounded-xl bg-muted/20 px-2 py-3 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.name] || "#6366f1" }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="text-[10px] text-muted-foreground">
              {((item.value / total) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
