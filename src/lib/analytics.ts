import {
  ChartDataPoint,
  ComparisonDimension,
  DateField,
  ProjectionPoint,
  ProjectionSummary,
  SegmentComparisonPoint,
  SegmentPlatformComparisonPoint,
  TabDateFilter,
  TimeGrouping,
  VendooListing,
  SellThroughPoint,
  ProfitDistributionPoint,
  DaysToSellPoint,
  PlatformFeePoint,
  BrandROIPoint,
  MonthlyPnLPoint,
  InventoryCostSummary,
  CategoryBreakdownRow,
  InventoryTableRow,
} from "./types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const DATE_FILTER_PRESET_DAYS = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "60d": 60,
  "90d": 90,
} as const;

const STATUS_ORDER = ["Active", "Sold", "Draft"];
const PLATFORM_ORDER = ["eBay", "Poshmark", "Mercari", "Depop", "Etsy", "In-Person", "Unknown"];

interface DateFilterRange {
  from?: Date;
  to?: Date;
}

interface ProjectionAccumulator {
  revenue: number;
  profit: number;
}

function round(n: number, d = 2): number {
  return Math.round(n * 10 ** d) / 10 ** d;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtCurrency(n: number): string {
  return "$" + fmt(n);
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}

export function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

export function endOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function parseListingDate(rawValue: string): Date | null {
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

export function formatDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(yyyymm: string): string {
  const [year, month] = yyyymm.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatDayLabel(yyyymmdd: string): string {
  const [year, month, day] = yyyymmdd.split("-").map((value) => Number(value));
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatPeriodLabel(key: string, grouping: TimeGrouping): string {
  return grouping === "day" ? formatDayLabel(key) : formatMonthLabel(key);
}

function resolveDateFilterRange(filter: TabDateFilter, now = new Date()): DateFilterRange | null {
  if (filter.preset === "all" && !filter.from && !filter.to) {
    return null;
  }

  if (filter.preset === "custom") {
    const fromDate = filter.from ? parseListingDate(filter.from) : null;
    const toDate = filter.to ? parseListingDate(filter.to) : null;

    if (!fromDate && !toDate) {
      return null;
    }

    return {
      from: fromDate ? startOfDay(fromDate) : undefined,
      to: toDate ? endOfDay(toDate) : undefined,
    };
  }

  const days = DATE_FILTER_PRESET_DAYS[filter.preset as keyof typeof DATE_FILTER_PRESET_DAYS];

  if (!days) {
    return null;
  }

  const to = endOfDay(now);
  const from = startOfDay(addDays(to, -(days - 1)));
  return { from, to };
}

function getGroupingKey(date: Date, grouping: TimeGrouping): string {
  return grouping === "day" ? formatDayKey(date) : formatMonthKey(date);
}

function sortWithPreferredOrder(values: string[], preferredOrder: string[]): string[] {
  return [...values].sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left);
    const rightIndex = preferredOrder.indexOf(right);

    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
}

export function getListingProfit(listing: VendooListing): number {
  return (
    listing.priceSold
    - listing.costOfGoods
    - listing.marketplaceFees
    - listing.shippingExpenses
  );
}

export function splitSegmentValues(rawValue: string): string[] {
  const uniqueValues = new Map<string, string>();

  for (const token of rawValue.split(",")) {
    const value = token.trim();

    if (!value) {
      continue;
    }

    const normalizedValue = value.toLowerCase();

    if (!uniqueValues.has(normalizedValue)) {
      uniqueValues.set(normalizedValue, value);
    }
  }

  return Array.from(uniqueValues.values());
}

export function filterListingsByDate(
  listings: VendooListing[],
  dateField: DateField,
  filter: TabDateFilter,
  now = new Date(),
): VendooListing[] {
  const range = resolveDateFilterRange(filter, now);

  if (!range) {
    return listings;
  }

  return listings.filter((listing) => {
    const parsedDate = parseListingDate(listing[dateField]);

    if (!parsedDate) {
      return false;
    }

    if (range.from && parsedDate < range.from) {
      return false;
    }

    if (range.to && parsedDate > range.to) {
      return false;
    }

    return true;
  });
}

export function getTimeGrouping(filter: TabDateFilter): TimeGrouping {
  const range = resolveDateFilterRange(filter);

  if (!range?.from || !range.to) {
    return "month";
  }

  const spanInDays = Math.round((endOfDay(range.to).getTime() - startOfDay(range.from).getTime()) / MS_PER_DAY) + 1;
  return spanInDays <= 90 ? "day" : "month";
}

export function calculateKPIs(listings: VendooListing[]) {
  const soldListings = listings.filter((listing) => listing.status === "Sold");
  const activeListings = listings.filter((listing) => listing.status === "Active");

  const totalRevenue = soldListings.reduce((sum, listing) => sum + listing.priceSold, 0);
  const totalCOGS = soldListings.reduce((sum, listing) => sum + listing.costOfGoods, 0);
  const totalFees = soldListings.reduce((sum, listing) => sum + listing.marketplaceFees, 0);
  const totalShipping = soldListings.reduce((sum, listing) => sum + listing.shippingExpenses, 0);
  const totalProfit = totalRevenue - totalCOGS - totalFees - totalShipping;
  const avgProfitPerItem = soldListings.length > 0 ? totalProfit / soldListings.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgDaysToSell = calculateAvgDaysToSell(soldListings);

  return {
    totalListings: fmtInt(listings.length),
    activeListing: fmtInt(activeListings.length),
    soldItems: fmtInt(soldListings.length),
    totalRevenue: fmtCurrency(totalRevenue),
    totalProfit: fmtCurrency(totalProfit),
    totalCOGS: fmtCurrency(totalCOGS),
    totalFees: fmtCurrency(totalFees),
    totalShipping: fmtCurrency(totalShipping),
    avgProfitPerItem: fmtCurrency(avgProfitPerItem),
    profitMargin: round(profitMargin, 1) + "%",
    avgDaysToSell: avgDaysToSell > 0 ? round(avgDaysToSell, 0) + " days" : "N/A",
    sellThroughRate: round((soldListings.length / Math.max(listings.length, 1)) * 100, 1) + "%",
  };
}

function calculateAvgDaysToSell(soldListings: VendooListing[]): number {
  let total = 0;
  let count = 0;

  for (const listing of soldListings) {
    const listedDate = parseListingDate(listing.listedDate);
    const soldDate = parseListingDate(listing.soldDate);

    if (!listedDate || !soldDate) {
      continue;
    }

    const difference = (soldDate.getTime() - listedDate.getTime()) / MS_PER_DAY;

    if (difference >= 0) {
      total += difference;
      count += 1;
    }
  }

  return count > 0 ? total / count : 0;
}

export function revenueByMonth(
  listings: VendooListing[],
  grouping: TimeGrouping = "month",
): ChartDataPoint[] {
  const soldListings = listings.filter((listing) => listing.status === "Sold" && listing.soldDate);
  const buckets = new Map<string, { revenue: number; profit: number; count: number }>();

  for (const listing of soldListings) {
    const soldDate = parseListingDate(listing.soldDate);

    if (!soldDate) {
      continue;
    }

    const key = getGroupingKey(soldDate, grouping);
    const existing = buckets.get(key) || { revenue: 0, profit: 0, count: 0 };

    existing.revenue += listing.priceSold;
    existing.profit += getListingProfit(listing);
    existing.count += 1;
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([key, value]) => ({
      name: formatPeriodLabel(key, grouping),
      value: round(value.revenue),
      revenue: round(value.revenue),
      profit: round(value.profit),
      sales: value.count,
    }));
}

export function salesByPlatform(listings: VendooListing[]): ChartDataPoint[] {
  const soldListings = listings.filter((listing) => listing.status === "Sold" && listing.soldPlatform);
  const buckets = new Map<string, { revenue: number; count: number; profit: number; fees: number }>();

  for (const listing of soldListings) {
    const existing = buckets.get(listing.soldPlatform) || { revenue: 0, count: 0, profit: 0, fees: 0 };

    existing.revenue += listing.priceSold;
    existing.count += 1;
    existing.profit += getListingProfit(listing);
    existing.fees += listing.marketplaceFees;
    buckets.set(listing.soldPlatform, existing);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => right[1].revenue - left[1].revenue)
    .map(([name, value]) => ({
      name,
      value: round(value.revenue),
      revenue: round(value.revenue),
      profit: round(value.profit),
      fees: round(value.fees),
      sales: value.count,
    }));
}

export function topBrands(listings: VendooListing[], limit = 15): ChartDataPoint[] {
  const soldListings = listings.filter((listing) => listing.status === "Sold" && listing.brand);
  const buckets = new Map<string, { revenue: number; count: number; profit: number }>();

  for (const listing of soldListings) {
    const existing = buckets.get(listing.brand) || { revenue: 0, count: 0, profit: 0 };

    existing.revenue += listing.priceSold;
    existing.count += 1;
    existing.profit += getListingProfit(listing);
    buckets.set(listing.brand, existing);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => right[1].revenue - left[1].revenue)
    .slice(0, limit)
    .map(([name, value]) => ({
      name,
      value: round(value.revenue),
      revenue: round(value.revenue),
      profit: round(value.profit),
      sales: value.count,
    }));
}

export function salesByCategory(listings: VendooListing[]): ChartDataPoint[] {
  const soldListings = listings.filter((listing) => listing.status === "Sold" && listing.category);
  const buckets = new Map<string, { revenue: number; count: number; profit: number }>();

  for (const listing of soldListings) {
    const existing = buckets.get(listing.category) || { revenue: 0, count: 0, profit: 0 };

    existing.revenue += listing.priceSold;
    existing.count += 1;
    existing.profit += getListingProfit(listing);
    buckets.set(listing.category, existing);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => right[1].revenue - left[1].revenue)
    .map(([name, value]) => ({
      name,
      value: round(value.revenue),
      revenue: round(value.revenue),
      profit: round(value.profit),
      sales: value.count,
    }));
}

export function statusDistribution(listings: VendooListing[]): ChartDataPoint[] {
  const counts = new Map<string, number>();

  for (const listing of listings) {
    counts.set(listing.status, (counts.get(listing.status) || 0) + 1);
  }

  return sortWithPreferredOrder(Array.from(counts.keys()), STATUS_ORDER)
    .map((name) => ({
      name,
      value: counts.get(name) || 0,
    }));
}

/** Distribution of listings by condition */
export function conditionDistribution(listings: VendooListing[]): ChartDataPoint[] {
  const counts = new Map<string, number>();

  for (const listing of listings) {
    const cond = listing.condition?.trim();
    if (cond) {
      counts.set(cond, (counts.get(cond) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Distribution of listings by primary color */
export function colorDistribution(listings: VendooListing[]): ChartDataPoint[] {
  const counts = new Map<string, number>();

  for (const listing of listings) {
    const color = listing.primaryColor?.trim();
    if (color) {
      counts.set(color, (counts.get(color) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Average metrics by platform */
export function platformFeeBreakdown(listings: VendooListing[]): { name: string; avgFee: number; totalFees: number; sales: number; avgFeePct: number }[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldPlatform);
  const buckets = new Map<string, { totalFees: number; totalPrice: number; count: number }>();

  for (const listing of sold) {
    const platform = listing.soldPlatform;
    const fees = listing.marketplaceFees || 0;
    const price = listing.priceSold || 0;
    const existing = buckets.get(platform) || { totalFees: 0, totalPrice: 0, count: 0 };
    existing.totalFees += fees;
    existing.totalPrice += price;
    existing.count += 1;
    buckets.set(platform, existing);
  }

  return Array.from(buckets.entries())
    .map(([name, data]) => ({
      name,
      avgFee: data.count > 0 ? data.totalFees / data.count : 0,
      totalFees: data.totalFees,
      sales: data.count,
      avgFeePct: data.totalPrice > 0 ? (data.totalFees / data.totalPrice) * 100 : 0,
    }))
    .sort((a, b) => b.totalFees - a.totalFees);
}

/** Cross-posting analysis: how many items are listed on multiple platforms */
export function crossPostingStats(listings: VendooListing[]): { singlePlatform: number; multiPlatform: number; avgPlatforms: number; platformCombos: { name: string; value: number }[] } {
  const combos = new Map<string, number>();
  let single = 0;
  let multi = 0;
  let totalPlatforms = 0;

  for (const listing of listings) {
    const platforms = listing.listingPlatforms?.split(",").map((p: string) => p.trim()).filter(Boolean) || [];
    if (platforms.length <= 1) {
      single++;
    } else {
      multi++;
      const combo = platforms.sort().join(" + ");
      combos.set(combo, (combos.get(combo) || 0) + 1);
    }
    totalPlatforms += platforms.length;
  }

  return {
    singlePlatform: single,
    multiPlatform: multi,
    avgPlatforms: listings.length > 0 ? totalPlatforms / listings.length : 0,
    platformCombos: Array.from(combos.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
  };
}

export function compareListingsBySegment(
  listings: VendooListing[],
  dimension: ComparisonDimension,
): SegmentComparisonPoint[] {
  const buckets = new Map<
    string,
    { name: string; listed: number; sales: number; revenue: number; profit: number }
  >();

  for (const listing of listings) {
    const rawValue = dimension === "labels" ? listing.labels : listing.tags;
    const values = splitSegmentValues(rawValue);

    for (const value of values) {
      const normalizedValue = value.toLowerCase();
      const existing = buckets.get(normalizedValue) || {
        name: value,
        listed: 0,
        sales: 0,
        revenue: 0,
        profit: 0,
      };

      existing.listed += 1;

      if (listing.status === "Sold") {
        existing.sales += 1;
        existing.revenue += listing.priceSold;
        existing.profit += getListingProfit(listing);
      }

      buckets.set(normalizedValue, existing);
    }
  }

  return Array.from(buckets.values()).map((segment) => ({
    name: segment.name,
    value: round(segment.revenue),
    listed: segment.listed,
    sales: segment.sales,
    revenue: round(segment.revenue),
    profit: round(segment.profit),
    sellThrough: segment.listed > 0 ? round((segment.sales / segment.listed) * 100, 1) : 0,
  }));
}

export function compareSegmentsByPlatform(
  listings: VendooListing[],
  dimension: ComparisonDimension,
): SegmentPlatformComparisonPoint[] {
  const soldListings = listings.filter((listing) => listing.status === "Sold");
  const buckets = new Map<
    string,
    {
      name: string;
      sales: number;
      revenue: number;
      profit: number;
      platforms: Map<string, { sales: number; revenue: number; profit: number }>;
    }
  >();

  for (const listing of soldListings) {
    const rawValue = dimension === "labels" ? listing.labels : listing.tags;
    const values = splitSegmentValues(rawValue);

    if (values.length === 0) {
      continue;
    }

    const platform = listing.soldPlatform?.trim() || "Unknown";
    const profit = getListingProfit(listing);

    for (const value of values) {
      const normalizedValue = value.toLowerCase();
      const existing = buckets.get(normalizedValue) || {
        name: value,
        sales: 0,
        revenue: 0,
        profit: 0,
        platforms: new Map<string, { sales: number; revenue: number; profit: number }>(),
      };
      const platformMetrics = existing.platforms.get(platform) || {
        sales: 0,
        revenue: 0,
        profit: 0,
      };

      existing.sales += 1;
      existing.revenue += listing.priceSold;
      existing.profit += profit;
      platformMetrics.sales += 1;
      platformMetrics.revenue += listing.priceSold;
      platformMetrics.profit += profit;

      existing.platforms.set(platform, platformMetrics);
      buckets.set(normalizedValue, existing);
    }
  }

  return Array.from(buckets.values())
    .map((segment) => ({
      name: segment.name,
      sales: segment.sales,
      revenue: round(segment.revenue),
      profit: round(segment.profit),
      platforms: Object.fromEntries(
        Array.from(segment.platforms.entries()).map(([platform, metrics]) => [
          platform,
          {
            sales: metrics.sales,
            revenue: round(metrics.revenue),
            profit: round(metrics.profit),
          },
        ]),
      ),
    }))
    .sort((left, right) => {
      if (right.revenue !== left.revenue) {
        return right.revenue - left.revenue;
      }

      if (right.profit !== left.profit) {
        return right.profit - left.profit;
      }

      if (right.sales !== left.sales) {
        return right.sales - left.sales;
      }

      return left.name.localeCompare(right.name);
    });
}

export function getAvailablePlatforms(listings: VendooListing[]): string[] {
  const soldPlatforms = new Set<string>();

  for (const listing of listings) {
    if (listing.soldPlatform?.trim()) {
      soldPlatforms.add(listing.soldPlatform.trim());
    }
  }

  return sortWithPreferredOrder(Array.from(soldPlatforms), PLATFORM_ORDER);
}

export function listingsByMonth(
  listings: VendooListing[],
  grouping: TimeGrouping = "month",
): ChartDataPoint[] {
  const datedListings = listings.filter((listing) => listing.listedDate);
  const buckets = new Map<string, number>();

  for (const listing of datedListings) {
    const listedDate = parseListingDate(listing.listedDate);

    if (!listedDate) {
      continue;
    }

    const key = getGroupingKey(listedDate, grouping);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([key, value]) => ({
      name: formatPeriodLabel(key, grouping),
      value,
      listings: value,
    }));
}

export function profitBreakdown(listings: VendooListing[]) {
  const soldListings = listings.filter((listing) => listing.status === "Sold");
  const revenue = round(soldListings.reduce((sum, listing) => sum + listing.priceSold, 0));
  const cogs = round(soldListings.reduce((sum, listing) => sum + listing.costOfGoods, 0));
  const fees = round(soldListings.reduce((sum, listing) => sum + listing.marketplaceFees, 0));
  const shipping = round(soldListings.reduce((sum, listing) => sum + listing.shippingExpenses, 0));
  const profit = round(revenue - cogs - fees - shipping);

  return [
    { name: "Revenue", value: revenue },
    { name: "COGS", value: -cogs },
    { name: "Fees", value: -fees },
    { name: "Shipping", value: -shipping },
    { name: "Net Profit", value: profit },
  ];
}

export function recentSales(listings: VendooListing[], limit = 20): VendooListing[] {
  return listings
    .filter((listing) => listing.status === "Sold" && listing.soldDate)
    .sort((left, right) => {
      const rightDate = parseListingDate(right.soldDate)?.getTime() || 0;
      const leftDate = parseListingDate(left.soldDate)?.getTime() || 0;
      return rightDate - leftDate;
    })
    .slice(0, limit);
}

export function recentListings(listings: VendooListing[], limit = 20): VendooListing[] {
  return listings
    .filter((listing) => listing.listedDate)
    .sort((left, right) => {
      const rightDate = parseListingDate(right.listedDate)?.getTime() || 0;
      const leftDate = parseListingDate(left.listedDate)?.getTime() || 0;
      return rightDate - leftDate;
    })
    .slice(0, limit);
}

export function buildRevenueProfitProjection(
  listings: VendooListing[],
  windowDays: number,
): { points: ProjectionPoint[]; summary: ProjectionSummary } {
  const soldListings = listings.filter((listing) => listing.status === "Sold" && listing.soldDate);
  const today = startOfDay(new Date());
  const windowStart = addDays(today, -(windowDays - 1));
  const dailyTotals = new Map<string, ProjectionAccumulator>();

  for (const listing of soldListings) {
    const soldDate = parseListingDate(listing.soldDate);

    if (!soldDate || soldDate < windowStart || soldDate > endOfDay(today)) {
      continue;
    }

    const key = formatDayKey(soldDate);
    const existing = dailyTotals.get(key) || { revenue: 0, profit: 0 };

    existing.revenue += listing.priceSold;
    existing.profit += getListingProfit(listing);
    dailyTotals.set(key, existing);
  }

  const points: ProjectionPoint[] = [];
  let actualRevenue = 0;
  let actualProfit = 0;

  for (let dayOffset = 0; dayOffset < windowDays; dayOffset += 1) {
    const date = addDays(windowStart, dayOffset);
    const key = formatDayKey(date);
    const totals = dailyTotals.get(key) || { revenue: 0, profit: 0 };

    actualRevenue += totals.revenue;
    actualProfit += totals.profit;
    points.push({
      name: formatDayLabel(key),
      dateKey: key,
      actualRevenue: round(actualRevenue),
      projectedRevenue: null,
      actualProfit: round(actualProfit),
      projectedProfit: null,
    });
  }

  const averageDailyRevenue = round(actualRevenue / Math.max(windowDays, 1));
  const averageDailyProfit = round(actualProfit / Math.max(windowDays, 1));

  if (points.length > 0) {
    const lastActualPoint = points[points.length - 1];
    lastActualPoint.projectedRevenue = lastActualPoint.actualRevenue;
    lastActualPoint.projectedProfit = lastActualPoint.actualProfit;
  }

  for (let dayOffset = 1; dayOffset <= windowDays; dayOffset += 1) {
    const date = addDays(today, dayOffset);
    const key = formatDayKey(date);

    points.push({
      name: formatDayLabel(key),
      dateKey: key,
      actualRevenue: null,
      projectedRevenue: round(actualRevenue + averageDailyRevenue * dayOffset),
      actualProfit: null,
      projectedProfit: round(actualProfit + averageDailyProfit * dayOffset),
    });
  }

  return {
    points,
    summary: {
      actualRevenue: round(actualRevenue),
      actualProfit: round(actualProfit),
      averageDailyRevenue,
      averageDailyProfit,
      projectedRevenue: round(averageDailyRevenue * windowDays),
      projectedProfit: round(averageDailyProfit * windowDays),
    },
  };
}

export function sellThroughByCategory(listings: VendooListing[]): SellThroughPoint[] {
  const buckets = new Map<string, { listed: number; sold: number }>();
  for (const listing of listings) {
    const cat = listing.category || "Unknown";
    const existing = buckets.get(cat) || { listed: 0, sold: 0 };
    existing.listed += 1;
    if (listing.status === "Sold") existing.sold += 1;
    buckets.set(cat, existing);
  }
  return Array.from(buckets.entries())
    .map(([category, { listed, sold }]) => ({
      category,
      listed,
      sold,
      rate: listed > 0 ? round((sold / listed) * 100, 1) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);
}

export function profitDistribution(soldListings: VendooListing[]): ProfitDistributionPoint[] {
  const BUCKETS = [
    { label: "< $0", min: -Infinity, max: 0 },
    { label: "$0–5", min: 0, max: 5 },
    { label: "$5–10", min: 5, max: 10 },
    { label: "$10–20", min: 10, max: 20 },
    { label: "$20–50", min: 20, max: 50 },
    { label: "$50+", min: 50, max: Infinity },
  ];
  const counts = BUCKETS.map((b) => ({ bucket: b.label, count: 0, profit: 0, min: b.min, max: b.max }));
  for (const listing of soldListings) {
    const profit = getListingProfit(listing);
    const bucket = counts.find((c) => profit >= c.min && profit < c.max);
    if (bucket) {
      bucket.count += 1;
      bucket.profit += profit;
    }
  }
  return counts.map(({ bucket, count, profit }) => ({ bucket, count, profit }));
}

export function daysToSellDistribution(soldListings: VendooListing[]): DaysToSellPoint[] {
  const BUCKETS = [
    { label: "< 7d", min: 0, max: 7 },
    { label: "7–14d", min: 7, max: 14 },
    { label: "14–30d", min: 14, max: 30 },
    { label: "30–60d", min: 30, max: 60 },
    { label: "60d+", min: 60, max: Infinity },
  ];
  const counts = BUCKETS.map((b) => ({ bucket: b.label, count: 0, minDays: b.min, maxDays: b.max }));
  for (const listing of soldListings) {
    const listedDate = parseListingDate(listing.listedDate);
    const soldDate = parseListingDate(listing.soldDate);
    if (!listedDate || !soldDate) continue;
    const days = Math.round((soldDate.getTime() - listedDate.getTime()) / MS_PER_DAY);
    if (days < 0) continue;
    const bucket = counts.find((c) => days >= c.minDays && days < c.maxDays);
    if (bucket) bucket.count += 1;
  }
  return counts.map(({ bucket, count, minDays, maxDays }) => ({ bucket, count, minDays, maxDays }));
}

export function platformFeeComparison(soldListings: VendooListing[]): PlatformFeePoint[] {
  const buckets = new Map<string, { revenue: number; fees: number; profit: number; count: number }>();
  for (const listing of soldListings) {
    const platform = listing.soldPlatform || "Unknown";
    const existing = buckets.get(platform) || { revenue: 0, fees: 0, profit: 0, count: 0 };
    existing.revenue += listing.priceSold;
    existing.fees += listing.marketplaceFees;
    existing.profit += getListingProfit(listing);
    existing.count += 1;
    buckets.set(platform, existing);
  }
  return Array.from(buckets.entries())
    .map(([platform, { revenue, fees, profit, count }]) => ({
      platform,
      avgFeeRate: revenue > 0 ? round((fees / revenue) * 100, 1) : 0,
      avgProfitRate: revenue > 0 ? round((profit / revenue) * 100, 1) : 0,
      totalRevenue: round(revenue),
      count,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function brandROI(soldListings: VendooListing[], limit = 15): BrandROIPoint[] {
  const buckets = new Map<string, { profit: number; cogs: number; revenue: number; count: number }>();
  for (const listing of soldListings) {
    const brand = listing.brand || "Unknown";
    const existing = buckets.get(brand) || { profit: 0, cogs: 0, revenue: 0, count: 0 };
    existing.profit += getListingProfit(listing);
    existing.cogs += listing.costOfGoods;
    existing.revenue += listing.priceSold;
    existing.count += 1;
    buckets.set(brand, existing);
  }
  return Array.from(buckets.entries())
    .map(([brand, { profit, cogs, revenue, count }]) => ({
      brand,
      roi: cogs > 0 ? round((profit / cogs) * 100, 1) : 0,
      profit: round(profit),
      cogs: round(cogs),
      revenue: round(revenue),
      count,
    }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, limit);
}

export function monthlyPnL(
  listings: VendooListing[],
  grouping: TimeGrouping = "month",
): MonthlyPnLPoint[] {
  const soldListings = listings.filter((l) => l.status === "Sold" && l.soldDate);
  const buckets = new Map<string, { revenue: number; cogs: number; fees: number; shipping: number; profit: number }>();
  for (const listing of soldListings) {
    const soldDate = parseListingDate(listing.soldDate);
    if (!soldDate) continue;
    const key = grouping === "day" ? formatDayKey(soldDate) : formatMonthKey(soldDate);
    const existing = buckets.get(key) || { revenue: 0, cogs: 0, fees: 0, shipping: 0, profit: 0 };
    existing.revenue += listing.priceSold;
    existing.cogs += listing.costOfGoods;
    existing.fees += listing.marketplaceFees;
    existing.shipping += listing.shippingExpenses;
    existing.profit += getListingProfit(listing);
    buckets.set(key, existing);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, { revenue, cogs, fees, shipping, profit }]) => ({
      month: formatPeriodLabel(key, grouping),
      revenue: round(revenue),
      cogs: round(cogs),
      fees: round(fees),
      shipping: round(shipping),
      profit: round(profit),
    }));
}

export function inventoryCostSummary(listings: VendooListing[]): InventoryCostSummary {
  const soldListings = listings.filter((l) => l.status === "Sold");
  const activeListings = listings.filter((l) => l.status === "Active");

  const totalInvestment = listings.reduce((sum, l) => sum + l.costOfGoods, 0);
  const realizedRevenue = soldListings.reduce((sum, l) => sum + l.priceSold, 0);
  const realizedProfit = soldListings.reduce((sum, l) => sum + getListingProfit(l), 0);
  const activeInventoryCost = activeListings.reduce((sum, l) => sum + l.costOfGoods, 0);
  const inventoryROI = totalInvestment > 0 ? round((realizedProfit / totalInvestment) * 100, 1) : 0;

  return {
    totalInvestment: round(totalInvestment),
    realizedRevenue: round(realizedRevenue),
    realizedProfit: round(realizedProfit),
    activeInventoryCost: round(activeInventoryCost),
    inventoryROI,
    soldCount: soldListings.length,
    activeCount: activeListings.length,
    totalCount: listings.length,
  };
}

export function categoryBreakdown(listings: VendooListing[]): CategoryBreakdownRow[] {
  const buckets = new Map<
    string,
    {
      listed: number;
      sold: number;
      totalRevenue: number;
      totalProfit: number;
      totalCOGS: number;
    }
  >();

  for (const listing of listings) {
    const cat = listing.category || "Unknown";
    const existing = buckets.get(cat) || {
      listed: 0,
      sold: 0,
      totalRevenue: 0,
      totalProfit: 0,
      totalCOGS: 0,
    };
    existing.listed += 1;
    if (listing.status === "Sold") {
      existing.sold += 1;
      existing.totalRevenue += listing.priceSold;
      existing.totalProfit += getListingProfit(listing);
      existing.totalCOGS += listing.costOfGoods;
    }
    buckets.set(cat, existing);
  }

  return Array.from(buckets.entries())
    .map(([category, { listed, sold, totalRevenue, totalProfit, totalCOGS }]) => ({
      category,
      listed,
      sold,
      sellThroughRate: listed > 0 ? round((sold / listed) * 100, 1) : 0,
      avgCOGS: sold > 0 ? round(totalCOGS / sold, 2) : 0,
      avgSalePrice: sold > 0 ? round(totalRevenue / sold, 2) : 0,
      avgProfit: sold > 0 ? round(totalProfit / sold, 2) : 0,
      profitMargin: totalRevenue > 0 ? round((totalProfit / totalRevenue) * 100, 1) : 0,
      totalRevenue: round(totalRevenue),
      totalProfit: round(totalProfit),
      totalCOGS: round(totalCOGS),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function inventoryTableData(listings: VendooListing[]): InventoryTableRow[] {
  return listings.map((listing, index) => {
    const listedDate = parseListingDate(listing.listedDate);
    const soldDate = parseListingDate(listing.soldDate);
    let daysToSell: number | null = null;
    if (listing.status === "Sold" && listedDate && soldDate) {
      const diff = (soldDate.getTime() - listedDate.getTime()) / MS_PER_DAY;
      if (diff >= 0) daysToSell = Math.round(diff);
    }
    const profit = listing.status === "Sold" ? getListingProfit(listing) : 0;
    return {
      id: listing.sku || `${index}`,
      title: listing.title,
      brand: listing.brand || "Unknown",
      category: listing.category || "Unknown",
      status: listing.status,
      costOfGoods: listing.costOfGoods,
      price: listing.price,
      priceSold: listing.status === "Sold" ? listing.priceSold : 0,
      profit,
      marketplaceFees: listing.marketplaceFees,
      shippingExpenses: listing.shippingExpenses,
      daysToSell,
      platform: listing.soldPlatform || listing.listingPlatforms || "—",
      listedDate: listing.listedDate,
      soldDate: listing.soldDate,
    };
  });
}

/* ─── Sparkline helpers (added for BTX-61) ─── */

export interface SparkPoint {
  value: number;
}

/** Revenue per day for the last N days from `now` (inclusive).
 *  Returns array in chronological order. */
export function dailyTotalsSparkline(
  listings: VendooListing[],
  days = 14,
  now = new Date(),
): SparkPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldDate);
  const today = startOfDay(now);
  const start = addDays(today, -(days - 1));
  const buckets = new Map<string, number>();

  // initialise every day so sparkline baseline is flat when there was no sales
  for (let i = 0; i < days; i++) {
    buckets.set(formatDayKey(addDays(start, i)), 0);
  }

  for (const l of sold) {
    const d = parseListingDate(l.soldDate);
    if (!d || d < start || d > endOfDay(today)) continue;
    const key = formatDayKey(d);
    buckets.set(key, (buckets.get(key) || 0) + l.priceSold);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ value: round(v) }));
}

export function dailyProfitSparkline(
  listings: VendooListing[],
  days = 14,
  now = new Date(),
): SparkPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldDate);
  const today = startOfDay(now);
  const start = addDays(today, -(days - 1));
  const buckets = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    buckets.set(formatDayKey(addDays(start, i)), 0);
  }

  for (const l of sold) {
    const d = parseListingDate(l.soldDate);
    if (!d || d < start || d > endOfDay(today)) continue;
    const key = formatDayKey(d);
    buckets.set(key, (buckets.get(key) || 0) + getListingProfit(l));
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ value: round(v) }));
}

export function dailyCountSparkline(
  listings: VendooListing[],
  days = 14,
  now = new Date(),
): SparkPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldDate);
  const today = startOfDay(now);
  const start = addDays(today, -(days - 1));
  const buckets = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    buckets.set(formatDayKey(addDays(start, i)), 0);
  }

  for (const l of sold) {
    const d = parseListingDate(l.soldDate);
    if (!d || d < start || d > endOfDay(today)) continue;
    const key = formatDayKey(d);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ value: v }));
}

/** Get the filter range for a date filter (extracted so we can compute previous period). */
export function getDateFilterRange(filter: TabDateFilter, now = new Date()) {
  return resolveDateFilterRange(filter, now);
}

/** Shift a date filter back by the same duration (used for period-over-period). 
 *  Returns a new filter for the "previous" matching period. */
export function previousPeriodFilter(
  filter: TabDateFilter,
  now = new Date(),
): TabDateFilter {
  const range = resolveDateFilterRange(filter, now);
  if (!range || (!range.from && !range.to)) {
    // cannot compute previous for "all" — fallback to last 30d
    return { preset: "30d", from: "", to: "" };
  }

  const to = range.to ?? endOfDay(now);
  const from = range.from ?? to;

  const spanMs = endOfDay(to).getTime() - startOfDay(from).getTime();
  const prevTo = new Date(from.getTime() - 1);           // 1ms before current from
  const prevFrom = new Date(prevTo.getTime() - spanMs);

  return {
    preset: "custom",
    from: formatDayKey(prevFrom),
    to: formatDayKey(prevTo),
  };
}

/** Simple business health score (0-100) based on profitability, sell-through, and activity trends. */
export function computeHealthScore(
  listings: VendooListing[],
  kpis: { totalRevenue: string; totalProfit: string; profitMargin: string; sellThroughRate: string; avgDaysToSell: string; activeListing: string; totalListings: string },
): number {
  const margin = parseFloat(kpis.profitMargin) || 0;
  const sellThrough = parseFloat(kpis.sellThroughRate) || 0;
  const daysToSell = parseFloat(kpis.avgDaysToSell) || 0;
  const activeRatio = kpis.activeListing && kpis.totalListings
    ? parseFloat(kpis.activeListing.replace(/[^0-9]/g, "")) / Math.max(parseFloat(kpis.totalListings.replace(/[^0-9]/g, "")), 1) * 100
    : 0;

  let score = 0;
  // Profit margin 0-100% → 0-40 points
  score += Math.min(margin, 100) * 0.4;
  // Sell-through 0-100% → 0-30 points
  score += Math.min(sellThrough, 100) * 0.3;
  // Active ratio 0-100% → 0-20 points
  score += Math.min(activeRatio, 100) * 0.2;
  // Days to sell inverse: 0d = 10pts, 365d = 0pts
  score += Math.max(0, (365 - daysToSell) / 365) * 10;

  return Math.min(Math.round(score), 100);
}

/** Get revenue/profit/count for a specific day */
export function getDayTotals(listings: VendooListing[], dayKey: string): { revenue: number; profit: number; count: number } {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldDate === dayKey);
  const revenue = sold.reduce((sum, l) => sum + l.priceSold, 0);
  const profit = sold.reduce((sum, l) => sum + getListingProfit(l), 0);
  return { revenue: round(revenue), profit: round(profit), count: sold.length };
}

/** Get today and yesterday day keys based on latest sold date in data */
export function getTodayYesterdayKeys(listings: VendooListing[], now = new Date()): { today: string; yesterday: string } {
  const todayKey = formatDayKey(startOfDay(now));
  const yesterdayKey = formatDayKey(addDays(startOfDay(now), -1));
  return { today: todayKey, yesterday: yesterdayKey };
}
