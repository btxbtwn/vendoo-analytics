"use client";

import { useMemo, useState } from "react";

import {
  buildRevenueProfitProjection,
  calculateKPIs,
  filterListingsByDate,
  getTimeGrouping,
  profitBreakdown,
  revenueByMonth,
  salesByCategory,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import CategoryChart from "../CategoryChart";
import ProfitBreakdownChart from "../ProfitBreakdownChart";
import ProjectionChart from "../ProjectionChart";
import RevenueChart from "../RevenueChart";
import TabDateFilterBar from "../TabDateFilterBar";

interface RevenuePanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

export default function RevenuePanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: RevenuePanelProps) {
  const [projectionWindow, setProjectionWindow] = useState(30);
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((listing) => listing.status === "Sold"), "soldDate", filter),
    [filter, listings],
  );
  const kpis = useMemo(() => calculateKPIs(soldListings), [soldListings]);
  const projection = useMemo(
    () => buildRevenueProfitProjection(soldListings, projectionWindow),
    [projectionWindow, soldListings],
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
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total Revenue", value: kpis.totalRevenue, color: "text-accent" },
          { label: "Net Profit", value: kpis.totalProfit, color: "text-success" },
          { label: "Total COGS", value: kpis.totalCOGS, color: "text-danger" },
          { label: "Fees", value: kpis.totalFees, color: "text-warning" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-4 md:p-5"
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
              {card.label}
            </p>
            <p className={`text-lg font-bold md:text-2xl ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <RevenueChart data={revenueByMonth(soldListings, grouping)} compact={compact} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
        <ProjectionChart
          data={projection.points}
          summary={projection.summary}
          windowDays={projectionWindow}
          onWindowChange={setProjectionWindow}
          compact={compact}
        />
        <ProfitBreakdownChart data={profitBreakdown(soldListings)} compact={compact} />
      </div>
      <CategoryChart data={salesByCategory(soldListings)} compact={compact} />
    </>
  );
}
