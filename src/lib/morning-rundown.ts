import "server-only";

import {
  buildRevenueProfitProjection,
  calculateKPIs,
  compareSegmentsByPlatform,
  getAvailablePlatforms,
  getListingProfit,
  inventoryCostSummary,
  salesByPlatform,
} from "./analytics";
import { getServerListingsCsvMetadata, loadServerListings } from "./server-listings";
import { SegmentPlatformComparisonPoint, VendooListing } from "./types";

const MS_PER_HOUR = 1000 * 60 * 60;
const STALE_AFTER_HOURS = 18;
const RECENT_WINDOW_DAYS = 7;
const PROJECTION_WINDOW_DAYS = 30;
const SEGMENT_LIMIT = 3;
const STALE_LISTING_DAYS = 90;

interface MorningRundownLineItem {
  name: string;
  value: number;
  sales: number;
}

export interface MorningDashboardRundownReport {
  generatedAt: string;
  csvModifiedAt: string;
  csvAgeHours: number;
  csvIsStale: boolean;
  summary: string;
  alerts: string[];
  insights: string[];
}

function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseListingDate(rawValue: string): Date | null {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return null;
  }

  const localDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (localDateMatch) {
    const [, year, month, day] = localDateMatch;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const parsedDate = new Date(trimmedValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatWholeNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function filterListingsByDateRange(
  listings: VendooListing[],
  dateField: "listedDate" | "soldDate",
  from: Date,
  toExclusive: Date,
): VendooListing[] {
  return listings.filter((listing) => {
    const parsedDate = parseListingDate(listing[dateField]);

    if (!parsedDate) {
      return false;
    }

    return parsedDate >= from && parsedDate < toExclusive;
  });
}

function sortSegmentsByProfit(segments: SegmentPlatformComparisonPoint[]): SegmentPlatformComparisonPoint[] {
  return [...segments].sort((left, right) => {
    if (right.profit !== left.profit) {
      return right.profit - left.profit;
    }

    if (right.sales !== left.sales) {
      return right.sales - left.sales;
    }

    return left.name.localeCompare(right.name);
  });
}

function pickTopLineItems(
  segments: SegmentPlatformComparisonPoint[],
  limit: number,
): MorningRundownLineItem[] {
  return sortSegmentsByProfit(segments)
    .filter((segment) => segment.profit > 0 || segment.sales > 0)
    .slice(0, limit)
    .map((segment) => ({
      name: segment.name,
      value: segment.profit,
      sales: segment.sales,
    }));
}

function formatLineItems(items: MorningRundownLineItem[]): string {
  if (items.length === 0) {
    return "none yet";
  }

  return items
    .map((item) => `${item.name} (${formatCurrency(item.value)}, ${formatWholeNumber(item.sales)} ${item.sales === 1 ? "sale" : "sales"})`)
    .join(", ");
}

function countStaleListings(listings: VendooListing[], now: Date): number {
  const cutoff = addDays(startOfDay(now), -STALE_LISTING_DAYS);
  return listings.filter((listing) => {
    if (listing.status !== "Active") return false;
    const listedDate = parseListingDate(listing.listedDate);
    return listedDate !== null && listedDate < cutoff;
  }).length;
}

interface PlatformBreakdownItem {
  name: string;
  value: number;
  revenue: number;
  profit: number;
  sales: number;
}

function buildPlatformBreakdown(
  platforms: PlatformBreakdownItem[],
): string {
  if (platforms.length === 0) return "none yet";

  return platforms
    .map((p) => `${p.name}: ${formatCurrency(p.revenue)} rev / ${formatCurrency(p.profit)} profit (${p.sales} ${p.sales === 1 ? "sale" : "sales"})`)
    .join("\n  ");
}

export async function buildMorningDashboardRundown(): Promise<MorningDashboardRundownReport> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = addDays(todayStart, -1);
  const recentWindowStart = addDays(todayStart, -RECENT_WINDOW_DAYS);
  const allListings = await loadServerListings();
  const { modifiedAt } = await getServerListingsCsvMetadata();
  const allSoldListings = allListings.filter((listing) => listing.status === "Sold");
  const allActiveListings = allListings.filter((listing) => listing.status === "Active");
  const yesterdaySold = filterListingsByDateRange(allSoldListings, "soldDate", yesterdayStart, todayStart);
  const yesterdayListed = filterListingsByDateRange(allListings, "listedDate", yesterdayStart, todayStart);
  const recentSold = filterListingsByDateRange(allSoldListings, "soldDate", recentWindowStart, todayStart);
  const recentListed = filterListingsByDateRange(allListings, "listedDate", recentWindowStart, todayStart);
  const csvAgeHours = Number(((now.getTime() - modifiedAt.getTime()) / MS_PER_HOUR).toFixed(1));
  const csvIsStale = csvAgeHours > STALE_AFTER_HOURS;

  const yesterdayKpis = calculateKPIs(yesterdaySold);
  const recentKpis = calculateKPIs(recentSold);
  const inventoryKpis = calculateKPIs(allListings);
  const draftCount = allListings.filter((listing) => listing.status === "Draft").length;
  const recentPlatforms = salesByPlatform(recentSold);
  const platformByProfit = [...recentPlatforms].sort(
    (left, right) => Number(right.profit || 0) - Number(left.profit || 0),
  );
  const topRevenuePlatform = recentPlatforms[0];
  const topProfitPlatform = platformByProfit[0];
  const knownPlatforms = getAvailablePlatforms(allSoldListings);
  const recentPlatformNames = new Set(recentPlatforms.map((platform) => platform.name));
  const quietPlatforms = knownPlatforms.filter((platform) => !recentPlatformNames.has(platform));
  const topLabels = pickTopLineItems(compareSegmentsByPlatform(recentSold, "labels"), SEGMENT_LIMIT);
  const topTags = pickTopLineItems(compareSegmentsByPlatform(recentSold, "tags"), SEGMENT_LIMIT);
  const projection = buildRevenueProfitProjection(allSoldListings, PROJECTION_WINDOW_DAYS);
  const recentNegativeProfitSales = recentSold.filter((listing) => getListingProfit(listing) < 0).length;
  const staleCount = countStaleListings(allListings, now);
  const costSummary = inventoryCostSummary(allListings);

  // Yesterday's top seller
  const yesterdayTopSeller = yesterdaySold.length > 0
    ? [...yesterdaySold].sort((a, b) => getListingProfit(b) - getListingProfit(a))[0]
    : null;

  // 7-day momentum: compare last 3 days vs prior 4 days
  const threeDaysAgo = addDays(todayStart, -3);
  const recent3dSold = filterListingsByDateRange(allSoldListings, "soldDate", threeDaysAgo, todayStart);
  const prior4dSold = filterListingsByDateRange(allSoldListings, "soldDate", recentWindowStart, threeDaysAgo);
  const rev3d = recent3dSold.reduce((s, l) => s + l.priceSold, 0);
  const rev4d = prior4dSold.reduce((s, l) => s + l.priceSold, 0);
  const momentumLabel = rev3d > rev4d * 0.75 ? "accelerating" : rev3d < rev4d * 0.5 ? "slowing" : "steady";

  // Build alerts
  const alerts: string[] = [];

  if (csvIsStale) {
    alerts.push(`CSV looks stale (${csvAgeHours.toFixed(1)}h old)`);
  }

  if (yesterdaySold.length === 0) {
    alerts.push("No sales were recorded yesterday");
  }

  if (yesterdayListed.length === 0) {
    alerts.push("No new listings were added yesterday");
  }

  if (recentNegativeProfitSales > 0) {
    alerts.push(`${recentNegativeProfitSales} recent sales had negative profit`);
  }

  if (quietPlatforms.length > 0) {
    alerts.push(`No recent sales on: ${quietPlatforms.slice(0, 3).join(", ")}`);
  }

  if (staleCount > 0) {
    alerts.push(`${staleCount} active listings are 90+ days old (${Math.round(staleCount / Math.max(allActiveListings.length, 1) * 100)}% of inventory)`);
  }

  // Build insights (actionable suggestions)
  const insights: string[] = [];

  if (recentListed.length === 0) {
    insights.push("Listings have stalled — adding 2-3 new items would help maintain sell-through pace");
  }

  if (quietPlatforms.length > 0) {
    insights.push(`${quietPlatforms[0]} has gone quiet — consider cross-listing a few recent best sellers there`);
  }

  if (topTags.length > 0 && topTags[0].sales >= 4) {
    insights.push(`"${topTags[0].name}" tag is hot (${topTags[0].sales} sales in 7 days) — source more items with this tag`);
  }

  if (staleCount > Math.max(allActiveListings.length * 0.6, 0)) {
    insights.push("Majority of inventory is stale — consider delisting underperformers and refreshing with new stock");
  }

  const recentMargin = recentKpis.profitMargin;
  const marginNum = parseFloat(recentMargin);
  if (!isNaN(marginNum) && marginNum < 40) {
    insights.push(`Margin is ${recentMargin} — review recent sales for high-fee platforms eating into profit`);
  }

  // Build text summary
  const sections = [
    "Vendoo Morning Dashboard Rundown",
    `Generated: ${formatTimestamp(now)}`,
    `CSV refreshed: ${formatTimestamp(modifiedAt)} (${csvAgeHours.toFixed(1)}h ago)${csvIsStale ? " [STALE]" : ""}`,
    "",

    "Yesterday",
    `- Sold: ${formatWholeNumber(yesterdaySold.length)}`,
    `- Revenue: ${yesterdayKpis.totalRevenue}`,
    `- Profit: ${yesterdayKpis.totalProfit} (${yesterdayKpis.profitMargin} margin)`,
    `- Avg profit/item: ${yesterdayKpis.avgProfitPerItem}`,
    `- COGS: ${yesterdayKpis.totalCOGS} · Fees: ${yesterdayKpis.totalFees} · Shipping: ${yesterdayKpis.totalShipping}`,
    `- New listings: ${formatWholeNumber(yesterdayListed.length)}`,
    yesterdayTopSeller
      ? `- Top seller: ${yesterdayTopSeller.title.slice(0, 60)}${yesterdayTopSeller.title.length > 60 ? "…" : ""} → ${formatCurrency(yesterdayTopSeller.priceSold)}`
      : "- Top seller: none",
    "",

    `Last ${RECENT_WINDOW_DAYS} complete days`,
    `- Sold: ${recentKpis.soldItems}`,
    `- Revenue: ${recentKpis.totalRevenue}`,
    `- Profit: ${recentKpis.totalProfit} (${recentKpis.profitMargin} margin)`,
    `- Avg profit/item: ${recentKpis.avgProfitPerItem}`,
    `- Avg days to sell: ${recentKpis.avgDaysToSell}`,
    `- New listings: ${formatWholeNumber(recentListed.length)}`,
    `- Momentum: ${momentumLabel}`,
    "",

    "Platform breakdown (7-day)",
    `  ${buildPlatformBreakdown(recentPlatforms as unknown as PlatformBreakdownItem[])}`,
    quietPlatforms.length > 0 ? `  Quiet: ${quietPlatforms.join(", ")}` : null,
    "",

    "Label and tag movers",
    `- Labels: ${formatLineItems(topLabels)}`,
    `- Tags: ${formatLineItems(topTags)}`,
    "",

    "Inventory watch",
    `- Active listings: ${inventoryKpis.activeListing}`,
    `- Draft listings: ${formatWholeNumber(draftCount)}`,
    `- Sell-through: ${inventoryKpis.sellThroughRate}`,
    `- Stale (90+ days): ${staleCount}`,
    `- Recent listing pace: ${formatWholeNumber(recentListed.length)} in the last ${RECENT_WINDOW_DAYS} days`,
    "",
    "Inventory cost",
    `- Total investment: ${formatCurrency(costSummary.totalInvestment)}`,
    `- Active inventory cost (capital tied up): ${formatCurrency(costSummary.activeInventoryCost)}`,
    `- Realized revenue: ${formatCurrency(costSummary.realizedRevenue)}`,
    `- Realized profit: ${formatCurrency(costSummary.realizedProfit)} (${costSummary.inventoryROI}% ROI)`,
    "",

    "Forward look",
    `- At the current ${PROJECTION_WINDOW_DAYS}D pace: ${formatCurrency(projection.summary.projectedRevenue)} revenue / ${formatCurrency(projection.summary.projectedProfit)} profit`,
    `- Daily average: ${formatCurrency(projection.summary.averageDailyRevenue)} rev / ${formatCurrency(projection.summary.averageDailyProfit)} profit`,
  ].filter((line): line is string => line !== null);

  if (insights.length > 0) {
    sections.push("", "Insights");
    for (const insight of insights) {
      sections.push(`- ${insight}`);
    }
  }

  if (alerts.length > 0) {
    sections.push("", "Alerts");
    for (const alert of alerts) {
      sections.push(`- ${alert}`);
    }
  }

  return {
    generatedAt: now.toISOString(),
    csvModifiedAt: modifiedAt.toISOString(),
    csvAgeHours,
    csvIsStale,
    summary: sections.join("\n"),
    alerts,
    insights,
  };
}