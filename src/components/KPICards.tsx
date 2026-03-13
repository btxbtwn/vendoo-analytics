"use client";

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Percent,
  Clock,
  Tag,
  BarChart,
} from "lucide-react";

interface KPICardsProps {
  kpis: {
    totalListings: string;
    activeListing: string;
    soldItems: string;
    totalRevenue: string;
    totalProfit: string;
    totalCOGS: string;
    totalFees: string;
    totalShipping: string;
    avgProfitPerItem: string;
    profitMargin: string;
    avgDaysToSell: string;
    sellThroughRate: string;
  };
  compact?: boolean;
}

export default function KPICards({ kpis, compact = false }: KPICardsProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: kpis.totalRevenue,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Net Profit",
      value: kpis.totalProfit,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Items Sold",
      value: kpis.soldItems,
      icon: ShoppingCart,
      color: "text-violet-400",
      bgColor: "bg-violet-400/10",
    },
    {
      label: "Active Listings",
      value: kpis.activeListing,
      icon: Package,
      color: "text-sky-400",
      bgColor: "bg-sky-400/10",
    },
    {
      label: "Profit Margin",
      value: kpis.profitMargin,
      icon: Percent,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Avg Days to Sell",
      value: kpis.avgDaysToSell,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Avg Profit/Item",
      value: kpis.avgProfitPerItem,
      icon: Tag,
      color: "text-pink-400",
      bgColor: "bg-pink-400/10",
    },
    {
      label: "Sell-Through Rate",
      value: kpis.sellThroughRate,
      icon: BarChart,
      color: "text-teal-400",
      bgColor: "bg-teal-400/10",
    },
  ];

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
                <p className={`text-xl font-bold tracking-tight ${card.color}`}>
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Supporting Metrics</h3>
            <span className="text-xs text-muted-foreground">4 values</span>
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-card rounded-2xl border border-border p-4 md:p-5 hover:border-accent/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}
              >
                <Icon size={16} className={card.color} />
              </div>
            </div>
            <p className={`text-xl md:text-2xl font-bold ${card.color} tracking-tight`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
