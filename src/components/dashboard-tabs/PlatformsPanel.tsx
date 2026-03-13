"use client";

import { salesByCategory, salesByPlatform, statusDistribution } from "../../lib/analytics";
import { VendooListing } from "../../lib/types";
import CategoryChart from "../CategoryChart";
import PlatformChart from "../PlatformChart";
import StatusChart from "../StatusChart";

interface PlatformsPanelProps {
  listings: VendooListing[];
  compact: boolean;
}

export default function PlatformsPanel({ listings, compact }: PlatformsPanelProps) {
  return (
    <>
      <PlatformChart data={salesByPlatform(listings)} compact={compact} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <CategoryChart data={salesByCategory(listings)} compact={compact} />
        <StatusChart data={statusDistribution(listings)} compact={compact} />
      </div>
    </>
  );
}