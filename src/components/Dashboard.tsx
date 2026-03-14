"use client";

import dynamic from "next/dynamic";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { calculateKPIs } from "../lib/analytics";
import { DashboardTabKey, TabDateFilter, VendooListing } from "../lib/types";

import Sidebar from "./Sidebar";
const OverviewPanel = dynamic(() => import("./dashboard-tabs/OverviewPanel"), { ssr: false });
const RevenuePanel = dynamic(() => import("./dashboard-tabs/RevenuePanel"), { ssr: false });
const PlatformsPanel = dynamic(() => import("./dashboard-tabs/PlatformsPanel"), { ssr: false });
const InventoryPanel = dynamic(() => import("./dashboard-tabs/InventoryPanel"), { ssr: false });
const BrandsPanel = dynamic(() => import("./dashboard-tabs/BrandsPanel"), { ssr: false });

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
    { label: "Revenue", value: kpis.totalRevenue, tone: "text-accent" },
    { label: "Profit", value: kpis.totalProfit, tone: "text-success" },
    { label: "Sell-through", value: kpis.sellThroughRate, tone: "text-teal-400" },
  ];

  function handleTabChange(tab: string) {
    if (!isDashboardTabKey(tab)) {
      return;
    }

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
      className={`min-h-screen bg-background md:grid ${
        isSidebarCollapsed
          ? "md:grid-cols-[5.5rem_minmax(0,1fr)]"
          : "md:grid-cols-[14rem_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />

      <main className="min-w-0 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-8">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2 sm:px-6 md:items-start lg:px-8 lg:py-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground md:text-3xl md:font-bold">
                {tabCopy.title}
              </h1>
              <p className="mt-1 hidden max-w-xl text-sm text-muted-foreground md:block">
                {tabCopy.description}
              </p>
            </div>
            <div className="shrink-0 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground md:px-3 md:py-1.5 md:text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium text-foreground">Live</span>
                <span className="hidden md:inline">Data</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1600px] min-w-0 max-w-full flex-col gap-4 overflow-x-hidden px-4 py-4 sm:px-6 lg:gap-6 lg:px-8 lg:py-6">
          <section className="surface-card rounded-[1.75rem] px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)] lg:items-end">
              <div>
                <p className="section-kicker mb-3">Snapshot</p>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[0.95rem]">
                  {listings.length.toLocaleString()} listings tracked · Last updated {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                {headerMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex min-h-[4.75rem] flex-col items-end justify-between rounded-2xl border border-border/70 bg-black/10 px-3 py-3 text-right"
                  >
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <p
                      className={`tabular-nums text-sm font-semibold leading-none md:text-base ${metric.tone}`}
                    >
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

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
