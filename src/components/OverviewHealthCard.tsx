"use client";

import { AlertTriangle, RefreshCw, TrendingUp, Zap } from "lucide-react";

interface OverviewHealthCardProps {
  healthScore: number;
  yesterdayRevenue: string;
  yesterdayProfit: string;
  yesterdaySold: number;
  todayRevenue: string;
  todayProfit: string;
  todaySold: number;
  onRefresh?: () => void;
}

function HealthRing({ score }: { score: number }) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const color = clamped >= 75 ? "#22c55e" : clamped >= 50 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const dash = (clamped / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#1e1e2e" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-foreground">{Math.round(clamped)}</span>
        <span className="text-[9px] uppercase tracking-widest text-secondary">Health</span>
      </div>
    </div>
  );
}

export default function OverviewHealthCard({
  healthScore,
  yesterdayRevenue,
  yesterdayProfit,
  yesterdaySold,
  todayRevenue,
  todayProfit,
  todaySold,
  onRefresh,
}: OverviewHealthCardProps) {
  const revDelta = parseFloat(todayRevenue.replace(/[^0-9.-]/g, "")) - parseFloat(yesterdayRevenue.replace(/[^0-9.-]/g, ""));
  const profDelta = parseFloat(todayProfit.replace(/[^0-9.-]/g, "")) - parseFloat(yesterdayProfit.replace(/[^0-9.-]/g, ""));
  const soldDelta = todaySold - yesterdaySold;

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center gap-5">
          <HealthRing score={healthScore} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Business Health</h3>
            <p className="mt-1 text-xs text-secondary">
              {healthScore >= 75
                ? "Strong performance across all metrics."
                : healthScore >= 50
                  ? "Average — watch inventory aging and pricing."
                  : "Needs attention. Check loss leaders and stale stock."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <YesterdayTodayCol label="Revenue" yesterday={yesterdayRevenue} today={todayRevenue} delta={revDelta} isCurrency />
          <YesterdayTodayCol label="Profit" yesterday={yesterdayProfit} today={todayProfit} delta={profDelta} isCurrency />
          <YesterdayTodayCol label="Sold" yesterday={`${yesterdaySold}`} today={`${todaySold}`} delta={soldDelta} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <QuickAction icon={RefreshCw} label="Refresh CSV" onClick={onRefresh} />
        <QuickAction icon={TrendingUp} label="View Inventory" href="/inventory" />
        <QuickAction icon={Zap} label="Repricing" href="#" />
        {healthScore < 50 && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-danger">
            <AlertTriangle size={14} />
            Review loss leaders
          </span>
        )}
      </div>
    </div>
  );
}

function YesterdayTodayCol({
  label,
  yesterday,
  today,
  delta,
  isCurrency = false,
}: {
  label: string;
  yesterday: string;
  today: string;
  delta: number;
  isCurrency?: boolean;
}) {
  const positive = delta >= 0;
  const abs = Math.abs(delta);
  const formatted = isCurrency ? `$${abs.toFixed(2)}` : `${abs}`;

  return (
    <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-3">
      <p className="section-kicker text-tertiary">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{today}</p>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <span className={positive ? "text-success" : "text-danger"}>
          {positive ? "▲" : "▼"} {formatted}
        </span>
        <span className="text-tertiary">yesterday</span>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-border-hover hover:text-foreground";

  if (href) {
    return (
      <a href={href} className={className}>
        <Icon size={13} />
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon size={13} />
      {label}
    </button>
  );
}
