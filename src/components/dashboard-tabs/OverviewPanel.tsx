"use client";

import {
  Clock,
  DollarSign,
  Percent,
  ShoppingCart,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

import {
  calculateKPIs,
  dailyCountSparkline,
  dailyProfitSparkline,
  dailyTotalsSparkline,
  filterListingsByDate,
  getTimeGrouping,
  previousPeriodFilter,
  recentSales,
  revenueByMonth,
  salesByPlatform,
} from "../../lib/analytics";
import type { TabDateFilter, VendooListing } from "../../lib/types";
import KPICards, { KPIItem } from "../KPICards";
import PlatformChart from "../PlatformChart";
import RecentSalesTable from "../RecentSalesTable";
import RevenueChart from "../RevenueChart";
import TabDateFilterBar from "../TabDateFilterBar";

interface OverviewPanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

/* ─── trend calculator ─── */
function calcTrend(currentValueStr: string, prevValueStr: string): number | undefined {
  const cur = parseFloat(currentValueStr.replace(/[^0-9.-]/g, ""));
  const prev = parseFloat(prevValueStr.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) return undefined;
  return Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;
}

export default function OverviewPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: OverviewPanelProps) {
  const allSold = useMemo(
    () => listings.filter((l) => l.status === "Sold"),
    [listings],
  );

  /* current period */
  const soldListings = useMemo(
    () => filterListingsByDate(allSold, "soldDate", filter),
    [filter, allSold],
  );
  const kpis = useMemo(() => calculateKPIs(soldListings), [soldListings]);

  /* previous period (for trends) */
  const prevFilter = useMemo(() => previousPeriodFilter(filter), [filter]);
  const prevSold = useMemo(
    () => filterListingsByDate(allSold, "soldDate", prevFilter),
    [prevFilter, allSold],
  );
  const prevKpis = useMemo(() => calculateKPIs(prevSold), [prevSold]);

  /* sparklines — last 14 days of the current filter window */
  const revenueSpark = useMemo(() => dailyTotalsSparkline(soldListings, 14), [soldListings]);
  const profitSpark = useMemo(() => dailyProfitSparkline(soldListings, 14), [soldListings]);
  const countSpark = useMemo(() => dailyCountSparkline(soldListings, 14), [soldListings]);

  /* assemble cards */
  const cards: KPIItem[] = useMemo(
    () => [
      {
        label: "Revenue",
        value: kpis.totalRevenue,
        icon: DollarSign,
        color: "text-primary",
        bgColor: "bg-[var(--color-bg-hover)]",
        trend: calcTrend(kpis.totalRevenue, prevKpis.totalRevenue),
        sparklineData: revenueSpark,
        goal: 78, // placeholder — wires to BTX-66 later
      },
      {
        label: "Net Profit",
        value: kpis.totalProfit,
        icon: TrendingUp,
        color: "text-primary",
        bgColor: "bg-[var(--color-bg-hover)]",
        trend: calcTrend(kpis.totalProfit, prevKpis.totalProfit),
        sparklineData: profitSpark,
        goal: 82, // placeholder
      },
      {
        label: "Items Sold",
        value: kpis.soldItems,
        icon: ShoppingCart,
        color: "text-primary",
        bgColor: "bg-[var(--color-bg-hover)]",
        trend: calcTrend(kpis.soldItems, prevKpis.soldItems),
        sparklineData: countSpark,
        goal: 65, // placeholder
      },
      {
        label: "Profit Margin",
        value: kpis.profitMargin,
        icon: Percent,
        color: "text-primary",
        bgColor: "bg-[var(--color-bg-hover)]",
        trend: calcTrend(kpis.profitMargin, prevKpis.profitMargin),
        goal: 55, // placeholder
      },
      {
        label: "Avg Profit / Item",
        value: kpis.avgProfitPerItem,
        icon: Tag,
        color: "text-primary",
        bgColor: "bg-[var(--color-bg-hover)]",
      },
      {
        label: "Avg Days to Sell",
        value: kpis.avgDaysToSell,
        icon: Clock,
        color: "text-primary",
        bgColor: "bg-[var(--color-bg-hover)]",
      },
    ],
    [kpis, prevKpis, revenueSpark, profitSpark, countSpark],
  );

  const grouping = getTimeGrouping(filter);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Date filter bar */}
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
      />
      {/* Top row: KPI cards */}
      <KPICards cards={cards} compact={compact} />

      {/* Recent Sales + Platform Breakdown */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Recent Sales &amp; Platform Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentSalesTable
              sales={recentSales(soldListings, 9999)}
              compact={compact}
            />
          </div>
          <div>
            <PlatformChart data={salesByPlatform(soldListings)} compact={compact} />
          </div>
        </div>
      </div>

      {/* Revenue Over Time */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Revenue Over Time
        </h2>
        <RevenueChart data={revenueByMonth(soldListings, grouping)} compact={compact} />
      </div>
    </div>
  );
}
