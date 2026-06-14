"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { TOOLTIP_STYLE } from "./ChartTheme";

/* ─── ResizeObserver hook ─── */
function useSparkReady() {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setReady(true); return; }
    if (el.offsetWidth > 0 && el.offsetHeight > 0) { setReady(true); return; }
    const obs = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setReady(true);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, ready };
}

interface SparklineProps {
  data: { value: number }[];
  color: string;
}

/**
 * Small memoized sparkline using AreaChart.
 * Renders a loading placeholder until the container has actual dimensions.
 */
export const Sparkline = memo(function Sparkline({
  data,
  color,
}: SparklineProps) {
  const { ref, ready } = useSparkReady();
  if (!data || data.length < 2) return null;

  const gradientId = `spark-fill-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div ref={ref} className="h-8 w-20 max-h-[32px]">
      {ready ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Tooltip
              contentStyle={{
                ...TOOLTIP_STYLE,
                padding: "6px 10px",
              }}
              itemStyle={{ color: "var(--color-text-primary)" }}
              formatter={(value: unknown) => [Number(value).toLocaleString(), ""]}
              labelStyle={{ display: "none" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-8 w-20 bg-muted/20" />
      )}
    </div>
  );
});
