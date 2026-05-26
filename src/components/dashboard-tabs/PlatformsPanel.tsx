"use client";

import { useMemo } from "react";

import { filterListingsByDate, salesByPlatform } from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import LabelTagComparisonPanel from "../LabelTagComparisonPanel";
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
      />
      {/* Sales by Platform + Labels/Tags */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Sales by Platform &amp; Labels/Tags
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <PlatformChart data={salesByPlatform(soldListings)} compact={compact} />
          </div>
          <div>
            <LabelTagComparisonPanel listings={soldListings} compact={compact} />
          </div>
        </div>
      </div>
    </div>
  );
}
