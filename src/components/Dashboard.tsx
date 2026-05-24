"use client";

import dynamic from "next/dynamic";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { calculateKPIs } from "../lib/analytics";
import { DashboardTabKey, TabDateFilter, VendooListing } from "../lib/types";

import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";
import TabNav, { Tab } from "./layout/TabNav";

const OverviewPanel = dynamic(() => import("./dashboard-tabs/OverviewPanel"));
const RevenuePanel = dynamic(() => import("./dashboard-tabs/RevenuePanel"));
const PlatformsPanel = dynamic(() => import("./dashboard-tabs/PlatformsPanel"));
const InventoryPanel = dynamic(() => import("./dashboard-tabs/InventoryPanel"));
const BrandsPanel = dynamic(() => import("./dashboard-tabs/BrandsPanel"));

interface DashboardProps {
  initialListings: VendooListing[];
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "revenue", label: "Revenue" },
  { id: "platforms", label: "Platforms" },
  { id: "inventory", label: "Inventory" },
  { id: "brands", label: "Brands" },
];

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
  const [tabFilters, setTabFilters] = useState<Record<DashboardTabKey, TabDateFilter>>({
    overview: createDefaultFilter(),
    revenue: createDefaultFilter(),
    platforms: createDefaultFilter(),
    inventory: createDefaultFilter(),
    brands: createDefaultFilter(),
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
  const kpis = calculateKPIs(listings);
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
        className="min-w-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-8 w-full"
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <Header title={tabCopy.title} />

        <div
          className="flex flex-col gap-4 px-0 py-4 sm:px-0 lg:gap-6 lg:px-0 lg:py-6"
          style={{
            width: "100%",
          }}
        >
          {/* Tab navigation */}
          <TabNav
            tabs={TABS}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

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
        </div>
      </main>
    </div>
  );
}
