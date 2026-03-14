"use client";

import { LucideIcon } from "lucide-react";

interface KPIItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface KPICardsProps {
  cards: KPIItem[];
  compact?: boolean;
}

export default function KPICards({ cards, compact = false }: KPICardsProps) {
  if (compact) {
    const primaryCards = cards.slice(0, 4);
    const secondaryCards = cards.slice(4);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {primaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {card.label}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${card.bgColor}`}>
                    <Icon size={16} className={card.color} />
                  </div>
                </div>
                <p className={`text-xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
              </div>
            );
          })}
        </div>

        {secondaryCards.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Supporting Metrics</h3>
              <span className="text-xs text-muted-foreground">{secondaryCards.length} values</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon size={14} className={card.color} />
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {card.label}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold ${card.color}`}>{card.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="group rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-accent/30 md:p-5"
          >
            <div className="mb-2 flex items-center justify-between md:mb-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:text-xs">
                {card.label}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor} md:h-9 md:w-9`}>
                <Icon size={16} className={card.color} />
              </div>
            </div>
            <p className={`text-xl font-bold tracking-tight md:text-2xl ${card.color}`}>{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
