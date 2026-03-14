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

function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
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

function formatDayKey(date: Date): string {
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

function formatPeriodLabel(key: string, grouping: TimeGrouping): string {
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
  const buckets = new Map<string, { revenue: number; count: number; profit: number }>();

  for (const listing of soldListings) {
    const existing = buckets.get(listing.soldPlatform) || { revenue: 0, count: 0, profit: 0 };

    existing.revenue += listing.priceSold;
    existing.count += 1;
    existing.profit += getListingProfit(listing);
    buckets.set(listing.soldPlatform, existing);
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
    { name: "Revenue", value: revenue, fill: "#6366f1" },
    { name: "COGS", value: -cogs, fill: "#ef4444" },
    { name: "Fees", value: -fees, fill: "#f97316" },
    { name: "Shipping", value: -shipping, fill: "#eab308" },
    { name: "Net Profit", value: profit, fill: "#22c55e" },
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
