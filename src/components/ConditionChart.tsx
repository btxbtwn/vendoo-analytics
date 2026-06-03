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

const CONDITION_COLORS: Record<string, string> = {
  "Pre-Owned - Good": "var(--chart-1)",
  "Pre-Owned - Excellent": "var(--chart-2)",
  "Pre-Owned - Fair": "var(--chart-3)",
  "New With Tags/Box": "var(--chart-4)",
  "New Without Tags/Box": "var(--chart-5)",
};

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

interface ConditionChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function ConditionChart({
  data,
  compact = false,
}: ConditionChartProps) {
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
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CONDITION_COLORS[entry.name] || PALETTE[index % PALETTE.length]}
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
      <div className={`mt-2 grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-3 gap-3 md:px-4"}`}>
        {data.slice(0, compact ? 4 : 6).map((item, index) => (
          <div key={item.name} className="rounded-none bg-muted/20 px-2 py-2 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <div
                className="w-2 h-2 rounded-none shrink-0"
                style={{ backgroundColor: CONDITION_COLORS[item.name] || PALETTE[index % PALETTE.length] }}
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
