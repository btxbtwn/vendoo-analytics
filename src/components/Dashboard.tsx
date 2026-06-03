"use client";

import dynamic from "next/dynamic";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { calculateKPIs, filterListingsByDate } from "../lib/analytics";
import { DashboardTabKey, TabDateFilter, VendooListing } from "../lib/types";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

import Sidebar from "./layout/Sidebar";

const OverviewPanel = dynamic(() => import("./dashboard-tabs/OverviewPanel"));
const RevenuePanel = dynamic(() => import("./dashboard-tabs/RevenuePanel"));
const PlatformsPanel = dynamic(() => import("./dashboard-tabs/PlatformsPanel"));
const InventoryPanel = dynamic(() => import("./dashboard-tabs/InventoryPanel"));
const BrandsPanel = dynamic(() => import("./dashboard-tabs/BrandsPanel"));
const LabelsPanel = dynamic(() => import("./dashboard-tabs/LabelsPanel"));

interface DashboardProps {
  initialListings: VendooListing[];
}

const TAB_COPY: Record<DashboardTabKey, { title: string; description: string }> = {
  overview: {
    title: "Dashboard Overview",
    description: "Revenue, profit, platform wins, and recent sold activity.",
  },
  revenue: {
    title: "Revenue Analytics",
    description: "Revenue, profit, projections, and category mix.",
  },
  platforms: {
    title: "Platform Performance",
    description: "Marketplace sales plus label and tag versus comparisons.",
  },
  inventory: {
    title: "Inventory Management",
    description: "Listings, status, sell-through, and recent inventory added.",
  },
  brands: {
    title: "Brand Analytics",
    description: "Top brands by revenue, sales, and profit in the selected window.",
  },
  labels: {
    title: "Labels & Tags",
    description: "Compare performance across labels and tags.",
  },
};

function createDefaultFilter(): TabDateFilter {
  return { preset: "all", from: "", to: "" };
}

function isDashboardTabKey(value: string): value is DashboardTabKey {
  return value in TAB_COPY;
}

export default function Dashboard({ initialListings }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabKey>("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const { toggleTheme } = useTheme();
  const [tabFilters, setTabFilters] = useState<Record<DashboardTabKey, TabDateFilter>>({
    overview: createDefaultFilter(),
    revenue: createDefaultFilter(),
    platforms: createDefaultFilter(),
    inventory: createDefaultFilter(),
    brands: createDefaultFilter(),
    labels: createDefaultFilter(),
  });
  const visibleTab = useDeferredValue(activeTab);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const listings = initialListings;

  // KPI header metrics — computed from the active tab's filter, not the full dataset
  const headerKPIs = useMemo(() => {
    const activeFilter = tabFilters[visibleTab];
    const allSold = listings.filter((l) => l.status === "Sold");
    const soldInWindow = filterListingsByDate(allSold, "soldDate", activeFilter);
    const totalInWindow = filterListingsByDate(listings, "listedDate", activeFilter);
    const kpis = calculateKPIs(soldInWindow);
    // Override STR: sold / (sold + active) — guarantees ≤ 100%
    const activeCount = listings.filter((l) => l.status === "Active").length;
    const denominator = soldInWindow.length + activeCount;
    const str =
      denominator > 0
        ? Math.round((soldInWindow.length / denominator) * 1000) / 10 + "%"
        : "0%";
    return { ...kpis, sellThroughRate: str };
  }, [listings, tabFilters, visibleTab]);

  const kpis = headerKPIs;
  const tabCopy = TAB_COPY[visibleTab];
  const headerMetrics = [
    { label: "Revenue", value: kpis.totalRevenue, tone: "text-primary" },
    { label: "Profit", value: kpis.totalProfit, tone: "text-primary" },
    { label: "STR", value: kpis.sellThroughRate, tone: "text-primary" },
  ];

  function handleTabChange(tab: string) {
    if (!isDashboardTabKey(tab)) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    startTransition(() => setActiveTab(tab));
  }

  function handleFilterChange(tab: DashboardTabKey, nextFilter: TabDateFilter) {
    setTabFilters((current) => ({
      ...current,
      [tab]: nextFilter,
    }));
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />

      <main
        className="min-w-0 overflow-y-auto overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+4rem)] md:pb-8 w-full"
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: isMobile ? "0" : isSidebarCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          transition: "padding-left 200ms var(--ease-out)",
        }}
      >
        <div
          className="flex flex-col gap-4 py-2 lg:gap-6 lg:py-6 px-3 md:px-[--content-padding]"
          style={{
            width: "100%",
          }}
        >
          {isMobile && (
            <div className="flex justify-end -mb-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-none border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Toggle theme"
              >
                <span className="relative block h-4 w-4">
                  <Moon size={16} className="absolute inset-0" style={{ opacity: "var(--moon-opacity, 1)" }} />
                  <Sun size={16} className="absolute inset-0" style={{ opacity: "var(--sun-opacity, 0)" }} />
                </span>
              </button>
            </div>
          )}
          {/* Tab panels */}
          {visibleTab === "overview" && (
            <OverviewPanel
              listings={listings}
              compact={isMobile}
              filter={tabFilters.overview}
              onFilterChange={(nextFilter) => handleFilterChange("overview", nextFilter)}
            />
          )}

          {visibleTab === "revenue" && (
            <RevenuePanel
              listings={listings}
              compact={isMobile}
              filter={tabFilters.revenue}
              onFilterChange={(nextFilter) => handleFilterChange("revenue", nextFilter)}
            />
          )}

          {visibleTab === "platforms" && (
            <PlatformsPanel
              listings={listings}
              compact={isMobile}
              filter={tabFilters.platforms}
              onFilterChange={(nextFilter) => handleFilterChange("platforms", nextFilter)}
            />
          )}

          {visibleTab === "inventory" && (
            <InventoryPanel
              listings={listings}
              compact={isMobile}
              filter={tabFilters.inventory}
              onFilterChange={(nextFilter) => handleFilterChange("inventory", nextFilter)}
            />
          )}

          {visibleTab === "brands" && (
            <BrandsPanel
              listings={listings}
              compact={isMobile}
              filter={tabFilters.brands}
              onFilterChange={(nextFilter) => handleFilterChange("brands", nextFilter)}
            />
          )}

          {visibleTab === "labels" && (
            <LabelsPanel
              listings={listings}
              compact={isMobile}
              filter={tabFilters.labels}
              onFilterChange={(nextFilter) => handleFilterChange("labels", nextFilter)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
