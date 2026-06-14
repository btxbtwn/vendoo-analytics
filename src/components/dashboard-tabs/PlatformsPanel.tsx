"use client";

import { useMemo } from "react";

import {
  filterListingsByDate,
  salesByPlatform,
  platformFeeBreakdown,
  crossPostingStats,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import CrossPostingCard from "../CrossPostingCard";
import FeeBreakdownTable from "../FeeBreakdownTable";
import GroupedPlatformMetricsChart from "../GroupedPlatformMetricsChart";
import PlatformChart from "../PlatformChart";
import TabDateFilterBar from "../TabDateFilterBar";

interface PlatformsPanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

export default function PlatformsPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: PlatformsPanelProps) {
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((listing) => listing.status === "Sold"), "soldDate", filter),
    [filter, listings],
  );

  const feeData = useMemo(() => platformFeeBreakdown(soldListings), [soldListings]);
  const crossPostData = useMemo(() => crossPostingStats(listings), [listings]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
        filter={filter}
        onFilterChange={onFilterChange}
      />
      {/* Key Metrics — Revenue / Profit / Fees by Platform */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Key Metrics
        </h2>
        <GroupedPlatformMetricsChart data={salesByPlatform(soldListings)} compact={compact} />
      </div>

      {/* Sales by Platform */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Sales by Platform
        </h2>
        <PlatformChart data={salesByPlatform(soldListings)} compact={compact} />
      </div>

      {/* Cross-Posting & Fee Breakdown */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Cross-Posting Efficiency
        </h2>
        <CrossPostingCard data={crossPostData} compact={compact} />
      </div>

      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Marketplace Fee Breakdown
        </h2>
        <FeeBreakdownTable data={feeData} compact={compact} />
      </div>
    </div>
  );
}
