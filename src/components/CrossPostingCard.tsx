"use client";

interface CrossPostingStatsProps {
  data: {
    singlePlatform: number;
    multiPlatform: number;
    avgPlatforms: number;
    platformCombos: { name: string; value: number }[];
  };
  compact?: boolean;
}

export default function CrossPostingCard({ data, compact = false }: CrossPostingStatsProps) {
  const total = data.singlePlatform + data.multiPlatform;
  const multiPct = total > 0 ? ((data.multiPlatform / total) * 100).toFixed(1) : "0";

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
      {/* Summary stats */}
      <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-3"} gap-4 mb-4`}>
        <div className="rounded-none bg-muted/20 px-3 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] mb-1">
            Single Platform
          </p>
          <p className="text-lg font-bold text-[var(--color-text-primary)]">{data.singlePlatform}</p>
        </div>
        <div className="rounded-none bg-muted/20 px-3 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] mb-1">
            Cross-Posted
          </p>
          <p className="text-lg font-bold text-[var(--color-text-primary)]">{data.multiPlatform}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">{multiPct}% of listings</p>
        </div>
        {!compact && (
          <div className="rounded-none bg-muted/20 px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] mb-1">
              Avg Platforms
            </p>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">{data.avgPlatforms.toFixed(1)}</p>
          </div>
        )}
      </div>

      {/* Top combos */}
      {data.platformCombos.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] mb-2">
            Top Platform Combos
          </p>
          <div className="space-y-1.5">
            {data.platformCombos.slice(0, compact ? 3 : 5).map((combo) => {
              const maxVal = data.platformCombos[0].value;
              const pct = (combo.value / maxVal) * 100;
              return (
                <div key={combo.name} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)] w-36 truncate shrink-0">
                    {combo.name}
                  </span>
                  <div className="flex-1 h-2 bg-[var(--color-bg-hover)] rounded-none overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-accent)] rounded-none"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text-primary)] w-8 text-right">
                    {combo.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
