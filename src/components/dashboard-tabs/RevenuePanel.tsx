"use client";

import { useMemo, useState } from "react";

import {
  buildRevenueProfitProjection,
  calculateKPIs,
  filterListingsByDate,
  profitBreakdown,
  salesByCategory,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import CategoryChart from "../CategoryChart";
import ProfitBreakdownChart from "../ProfitBreakdownChart";
import ProjectionChart from "../ProjectionChart";
import TabDateFilterBar from "../TabDateFilterBar";
import { useAppFilter } from "../../lib/AppContext";

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
  const { filter: globalFilter } = useAppFilter();
  const [projectionWindow, setProjectionWindow] = useState(30);
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((listing) => listing.status === "Sold"), "soldDate", globalFilter),
    [globalFilter, listings],
  );
  const kpis = useMemo(() => calculateKPIs(soldListings), [soldListings]);
  const projection = useMemo(
    () => buildRevenueProfitProjection(soldListings, projectionWindow),
    [projectionWindow, soldListings],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
      />
      {/* KPI Cards */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: kpis.totalRevenue, color: "text-primary" },
            { label: "Net Profit", value: kpis.totalProfit, color: "text-primary" },
            { label: "Total COGS", value: kpis.totalCOGS, color: "text-danger" },
          ].map((card) => (
            <div
              key={card.label}
              className="border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-4 md:p-5"
            >
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] md:text-xs">
                {card.label}
              </p>
              <p className={`text-lg font-bold md:text-2xl ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Category Breakdown + Projection / Profit */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Revenue Breakdown &amp; Projection
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryChart data={salesByCategory(soldListings)} compact={compact} />
          <div>
            <ProjectionChart
              data={projection.points}
              summary={projection.summary}
              windowDays={projectionWindow}
              onWindowChange={setProjectionWindow}
              compact={compact}
            />
            <div className="mt-4">
              <ProfitBreakdownChart data={profitBreakdown(soldListings)} compact={compact} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
