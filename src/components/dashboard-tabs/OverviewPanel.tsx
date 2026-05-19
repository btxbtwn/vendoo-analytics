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
  computeHealthScore,
  dailyCountSparkline,
  dailyProfitSparkline,
  dailyTotalsSparkline,
  filterListingsByDate,
  formatDayKey,
  getDayTotals,
  getTimeGrouping,
  previousPeriodFilter,
  recentSales,
  revenueByMonth,
  salesByPlatform,
  startOfDay,
  addDays,
} from "../../lib/analytics";
import type { TabDateFilter, VendooListing } from "../../lib/types";
import InventoryAgingCard from "../InventoryAgingCard";
import KPICards, { KPIItem } from "../KPICards";
import OverviewHealthCard from "../OverviewHealthCard";
import PlatformChart from "../PlatformChart";
import RecentSalesTable from "../RecentSalesTable";
import RevenueChart from "../RevenueChart";
import ProfitabilityAlertCard from "../ProfitabilityAlertCard";
import GoalsCard from "../GoalsCard";
import PeriodComparisonChart from "../PeriodComparisonChart";
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
        color: "text-accent",
        bgColor: "bg-accent/10",
        trend: calcTrend(kpis.totalRevenue, prevKpis.totalRevenue),
        sparklineData: revenueSpark,
        goal: 78, // placeholder — wires to BTX-66 later
      },
      {
        label: "Net Profit",
        value: kpis.totalProfit,
        icon: TrendingUp,
        color: "text-success",
        bgColor: "bg-success/10",
        trend: calcTrend(kpis.totalProfit, prevKpis.totalProfit),
        sparklineData: profitSpark,
        goal: 82, // placeholder
      },
      {
        label: "Items Sold",
        value: kpis.soldItems,
        icon: ShoppingCart,
        color: "text-violet-400",
        bgColor: "bg-violet-400/10",
        trend: calcTrend(kpis.soldItems, prevKpis.soldItems),
        sparklineData: countSpark,
        goal: 65, // placeholder
      },
      {
        label: "Profit Margin",
        value: kpis.profitMargin,
        icon: Percent,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        trend: calcTrend(kpis.profitMargin, prevKpis.profitMargin),
        goal: 55, // placeholder
      },
      {
        label: "Avg Profit / Item",
        value: kpis.avgProfitPerItem,
        icon: Tag,
        color: "text-pink-400",
        bgColor: "bg-pink-400/10",
      },
      {
        label: "Avg Days to Sell",
        value: kpis.avgDaysToSell,
        icon: Clock,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
      },
    ],
    [kpis, prevKpis, revenueSpark, profitSpark, countSpark],
  );

  const healthScore = useMemo(() => computeHealthScore(allSold, kpis), [allSold, kpis]);

  /* today / yesterday for health card */
  const todayTotals = useMemo(() => getDayTotals(allSold, formatDayKey(startOfDay(new Date()))), [allSold]);
  const yesterdayTotals = useMemo(() => getDayTotals(allSold, formatDayKey(addDays(startOfDay(new Date()), -1))), [allSold]);

  const grouping = getTimeGrouping(filter);

  return (
    <>
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        filter={filter}
        onChange={onFilterChange}
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
      />
      <OverviewHealthCard
        healthScore={healthScore}
        yesterdayRevenue={`$${yesterdayTotals.revenue.toFixed(2)}`}
        yesterdayProfit={`$${yesterdayTotals.profit.toFixed(2)}`}
        yesterdaySold={yesterdayTotals.count}
        todayRevenue={`$${todayTotals.revenue.toFixed(2)}`}
        todayProfit={`$${todayTotals.profit.toFixed(2)}`}
        todaySold={todayTotals.count}
        onRefresh={() => window.location.reload()}
      />
      <InventoryAgingCard listings={listings.filter((l) => l.status === "Active")} compact={compact} />
      <ProfitabilityAlertCard listings={listings} />
      <GoalsCard
        currentRevenue={parseFloat(kpis.totalRevenue.replace(/[^0-9.-]/g, "")) || 0}
        currentProfit={parseFloat(kpis.totalProfit.replace(/[^0-9.-]/g, "")) || 0}
        currentItems={parseInt(kpis.soldItems, 10) || 0}
      />
      <KPICards cards={cards} compact={compact} />
      <PeriodComparisonChart
        currentData={revenueByMonth(soldListings, grouping).map((d) => ({
          name: d.name,
          revenue: Number(d.revenue || 0),
          profit: Number(d.profit || 0),
        }))}
        previousData={revenueByMonth(prevSold, grouping).map((d) => ({
          name: d.name,
          revenue: Number(d.revenue || 0),
          profit: Number(d.profit || 0),
        }))}
        compact={compact}
      />
      <RevenueChart data={revenueByMonth(soldListings, grouping)} compact={compact} />
      <PlatformChart data={salesByPlatform(soldListings)} compact={compact} />
      <RecentSalesTable
        sales={recentSales(soldListings, compact ? 10 : 20)}
        compact={compact}
      />
    </>
  );
}
