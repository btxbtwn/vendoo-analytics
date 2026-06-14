"use client";

import dynamic from "next/dynamic";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { calculateKPIs, filterListingsByDate } from "../lib/analytics";
import { DashboardTabKey, TabDateFilter, VendooListing } from "../lib/types";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

import Sidebar from "./layout/Sidebar";
import LoadingSkeleton from "./LoadingSkeleton";
import CsvWarningsBanner from "./CsvWarningsBanner";

const loader = () => <LoadingSkeleton />;

const OverviewPanel = dynamic(() => import("./dashboard-tabs/OverviewPanel"), { loading: loader });
const RevenuePanel = dynamic(() => import("./dashboard-tabs/RevenuePanel"), { loading: loader });
const PlatformsPanel = dynamic(() => import("./dashboard-tabs/PlatformsPanel"), { loading: loader });
const InventoryPanel = dynamic(() => import("./dashboard-tabs/InventoryPanel"), { loading: loader });
const BrandsPanel = dynamic(() => import("./dashboard-tabs/BrandsPanel"), { loading: loader });
const LabelsPanel = dynamic(() => import("./dashboard-tabs/LabelsPanel"), { loading: loader });

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

  const headerKPIs = useMemo(() => {
    const activeFilter = tabFilters[visibleTab];
    const allSold = initialListings.filter((l) => l.status === "Sold");
    const soldInWindow = filterListingsByDate(allSold, "soldDate", activeFilter);
    const kpis = calculateKPIs(soldInWindow);
    // Cohort STR: sold among listings listed in period / total listed in period
    const listedInWindow = filterListingsByDate(initialListings, "listedDate", activeFilter);
    const eligiblePool = listedInWindow.filter(
      (l) => l.status === "Sold" || l.status === "Active"
    );
    const soldFromCohort = listedInWindow.filter((l) => l.status === "Sold");
    const str =
      eligiblePool.length > 0
        ? Math.round((soldFromCohort.length / eligiblePool.length) * 1000) / 10 + "%"
        : "0%";
    return { ...kpis, sellThroughRate: str };
  }, [initialListings, tabFilters, visibleTab]);

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
          <CsvWarningsBanner />
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
              listings={initialListings}
              compact={isMobile}
              filter={tabFilters.overview}
              onFilterChange={(nextFilter) => handleFilterChange("overview", nextFilter)}
            />
          )}

          {visibleTab === "revenue" && (
            <RevenuePanel
              listings={initialListings}
              compact={isMobile}
              filter={tabFilters.revenue}
              onFilterChange={(nextFilter) => handleFilterChange("revenue", nextFilter)}
            />
          )}

          {visibleTab === "platforms" && (
            <PlatformsPanel
              listings={initialListings}
              compact={isMobile}
              filter={tabFilters.platforms}
              onFilterChange={(nextFilter) => handleFilterChange("platforms", nextFilter)}
            />
          )}

          {visibleTab === "inventory" && (
            <InventoryPanel
              listings={initialListings}
              compact={isMobile}
              filter={tabFilters.inventory}
              onFilterChange={(nextFilter) => handleFilterChange("inventory", nextFilter)}
            />
          )}

          {visibleTab === "brands" && (
            <BrandsPanel
              listings={initialListings}
              compact={isMobile}
              filter={tabFilters.brands}
              onFilterChange={(nextFilter) => handleFilterChange("brands", nextFilter)}
            />
          )}

          {visibleTab === "labels" && (
            <LabelsPanel
              listings={initialListings}
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
