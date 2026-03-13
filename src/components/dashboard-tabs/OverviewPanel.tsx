"use client";

import { revenueByMonth, salesByPlatform, statusDistribution, recentSales, calculateKPIs } from "../../lib/analytics";
import { VendooListing } from "../../lib/types";
import KPICards from "../KPICards";
import RecentSalesTable from "../RecentSalesTable";
import RevenueChart from "../RevenueChart";
import PlatformChart from "../PlatformChart";
import StatusChart from "../StatusChart";

interface OverviewPanelProps {
  listings: VendooListing[];
  compact: boolean;
}

export default function OverviewPanel({ listings, compact }: OverviewPanelProps) {
  const kpis = calculateKPIs(listings);

  return (
    <>
      <KPICards kpis={kpis} compact={compact} />
      <RevenueChart data={revenueByMonth(listings)} compact={compact} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <PlatformChart data={salesByPlatform(listings)} compact={compact} />
        <StatusChart data={statusDistribution(listings)} compact={compact} />
      </div>
      <RecentSalesTable
        sales={recentSales(listings, compact ? 10 : 20)}
        compact={compact}
      />
    </>
  );
}