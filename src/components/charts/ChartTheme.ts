/**
 * Centralized chart theming for Recharts-based dashboard.
 * All chart styling should use exports from this module.
 */

import { PLATFORM_COLORS } from "../../lib/platform-colors";

// ─── Semantic platform color map ────────────────────────────────────────────
export const CHART_COLORS: Record<string, string> = {
  ...PLATFORM_COLORS,
  Unknown: "#95A5A6",
  // Fallback series colors when no platform is specified
  accent: "var(--chart-1)",
  success: "var(--chart-2)",
  warning: "var(--chart-3)",
  danger: "var(--chart-4)",
  purple: "var(--chart-5)",
  cyan: "var(--chart-6)",
  orange: "var(--chart-7)",
  green: "var(--chart-8)",
};

// ─── Shared base props for all charts ───────────────────────────────────────
export const CHART_BASE_PROPS = {
  margin: { top: 5, right: 20, left: 0, bottom: 5 },
  marginCompact: { top: 5, right: 8, left: -20, bottom: 0 },
} as const;

// ─── Shared tooltip content style ────────────────────────────────────────────
export const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "0px", // sharp corners throughout dashboard
  fontSize: "var(--text-xs)",
  color: "var(--color-text-primary)",
  padding: "12px", // p-3 equivalent
  boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
};

// ─── Cartesian grid style ────────────────────────────────────────────────────
export const CARTESIAN_GRID_STYLE = {
  stroke: "rgba(255,255,255,0.04)",
  strokeDasharray: "3 3",
} as const;

// ─── Axis tick styles ───────────────────────────────────────────────────────
export const AXIS_TICK_STYLE = {
  fill: "var(--color-text-tertiary)",
  fontSize: 11,
} as const;

export const AXIS_LINE_STYLE = {
  stroke: "var(--color-border)",
} as const;

export const AXIS_TICK_LINE_STYLE = false as const;

// ─── Chart height presets ──────────────────────────────────────────────────
export const CHART_HEIGHTS = {
  compact: "h-56",
  default: "h-60 md:h-72 xl:h-80",
  tall: "h-64 md:h-80 xl:h-[26rem]",
} as const;

// ─── Linear gradient factory helper ──────────────────────────────────────────
/**
 * Generate a linearGradient id string safe for use in Recharts defs.
 * Pass the same id to the fill prop of the chart element.
 */
export function sparklineGradientId(color: string): string {
  return `spark-fill-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
}

// ─── createChartProps helper ────────────────────────────────────────────────
export interface ChartPropsOptions {
  compact?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  height?: "compact" | "default" | "tall";
}

/**
 * Returns a consistent set of Recharts props given options.
 * Charts may override individual values as needed.
 */
export function createChartProps(options: ChartPropsOptions = {}) {
  const {
    compact = false,
    showGrid = true,
    showAxes = true,
    height = "default",
  } = options;

  return {
    margin: compact ? CHART_BASE_PROPS.marginCompact : CHART_BASE_PROPS.margin,
    height: CHART_HEIGHTS[height],
    showGrid,
    showAxes,
  };
}
