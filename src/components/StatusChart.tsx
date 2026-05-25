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
  Active: "var(--chart-1)",
  Sold: "var(--chart-2)",
  Draft: "var(--color-text-tertiary)",
};

interface StatusChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function StatusChart({
  data,
  compact = false,
}: StatusChartProps) {
  const { ref, ready } = useChartReady();
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className={compact ? "h-48" : "h-56 md:h-64"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                    fill={STATUS_COLORS[entry.name] || "var(--chart-1)"}
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
          <div className="h-full bg-muted/20" />
        )}
      </div>
      <div className={`mt-2 grid ${compact ? "grid-cols-3 gap-2" : "grid-cols-3 gap-4 md:px-6"}`}>
        {data.map((item) => (
          <div key={item.name} className="rounded-xl bg-muted/20 px-2 py-3 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.name] || "var(--chart-1)" }}
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
