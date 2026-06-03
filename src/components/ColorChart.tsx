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

const COLOR_HEX: Record<string, string> = {
  Black: "#1a1a1a",
  White: "#e0e0e0",
  Blue: "#3b82f6",
  Red: "#ef4444",
  Green: "#22c55e",
  Pink: "#ec4899",
  Purple: "#a855f7",
  Yellow: "#eab308",
  Orange: "#f97316",
  Brown: "#92400e",
  Gray: "#6b7280",
  Beige: "#d4a574",
  Cream: "#fef3c7",
  Gold: "#d4a017",
  Silver: "#94a3b8",
  Navy: "#1e3a5f",
  Multicolor: "#8b5cf6",
};

const PALETTE = [
  "#3b82f6", "#ef4444", "#22c55e", "#eab308", "#f97316",
  "#ec4899", "#a855f7", "#06b6d4", "#84cc16", "#f43f5e",
];

interface ColorChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function ColorChart({
  data,
  compact = false,
}: ColorChartProps) {
  const { ref, ready } = useChartReady();
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
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
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLOR_HEX[entry.name] || PALETTE[index % PALETTE.length]}
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
      <div className={`mt-2 grid ${compact ? "grid-cols-3 gap-2" : "grid-cols-4 gap-2 md:px-4"}`}>
        {data.slice(0, compact ? 6 : 8).map((item, index) => (
          <div key={item.name} className="rounded-none bg-muted/20 px-2 py-2 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <div
                className="w-2 h-2 rounded-none shrink-0"
                style={{ backgroundColor: COLOR_HEX[item.name] || PALETTE[index % PALETTE.length] }}
              />
              <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{item.value}</p>
            <p className="text-[10px] text-muted-foreground">
              {((item.value / total) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
