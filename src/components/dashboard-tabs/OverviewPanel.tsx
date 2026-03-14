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
  filterListingsByDate,
  getTimeGrouping,
  recentSales,
  revenueByMonth,
  salesByPlatform,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import KPICards from "../KPICards";
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

export default function OverviewPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: OverviewPanelProps) {
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((listing) => listing.status === "Sold"), "soldDate", filter),
    [filter, listings],
  );
  const kpis = useMemo(() => calculateKPIs(soldListings), [soldListings]);
  const cards = useMemo(
    () => [
      {
        label: "Revenue",
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
        label: "Profit Margin",
        value: kpis.profitMargin,
        icon: Percent,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
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
    [kpis],
  );
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
      <KPICards cards={cards} compact={compact} />
      <RevenueChart data={revenueByMonth(soldListings, grouping)} compact={compact} />
      <PlatformChart data={salesByPlatform(soldListings)} compact={compact} />
      <RecentSalesTable
        sales={recentSales(soldListings, compact ? 10 : 20)}
        compact={compact}
      />
    </>
  );
}
