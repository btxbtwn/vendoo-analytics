import { VendooListing, ChartDataPoint } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function round(n: number, d = 2): number {
  return Math.round(n * 10 ** d) / 10 ** d;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCurrency(n: number): string {
  return "$" + fmt(n);
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}

// ─── Core KPIs ──────────────────────────────────────────────────────────────

export function calculateKPIs(listings: VendooListing[]) {
  const sold = listings.filter((l) => l.status === "Sold");
  const active = listings.filter((l) => l.status === "Active");

  const totalRevenue = sold.reduce((s, l) => s + l.priceSold, 0);
  const totalCOGS = sold.reduce((s, l) => s + l.costOfGoods, 0);
  const totalFees = sold.reduce((s, l) => s + l.marketplaceFees, 0);
  const totalShipping = sold.reduce((s, l) => s + l.shippingExpenses, 0);
  const totalProfit = totalRevenue - totalCOGS - totalFees - totalShipping;
  const avgProfitPerItem = sold.length > 0 ? totalProfit / sold.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgDaysToSell = calculateAvgDaysToSell(sold);

  return {
    totalListings: fmtInt(listings.length),
    activeListing: fmtInt(active.length),
    soldItems: fmtInt(sold.length),
    totalRevenue: fmtCurrency(totalRevenue),
    totalProfit: fmtCurrency(totalProfit),
    totalCOGS: fmtCurrency(totalCOGS),
    totalFees: fmtCurrency(totalFees),
    totalShipping: fmtCurrency(totalShipping),
    avgProfitPerItem: fmtCurrency(avgProfitPerItem),
    profitMargin: round(profitMargin, 1) + "%",
    avgDaysToSell: avgDaysToSell > 0 ? round(avgDaysToSell, 0) + " days" : "N/A",
    sellThroughRate: round((sold.length / Math.max(listings.length, 1)) * 100, 1) + "%",
  };
}

function calculateAvgDaysToSell(sold: VendooListing[]): number {
  let total = 0;
  let count = 0;
  for (const l of sold) {
    if (l.listedDate && l.soldDate) {
      const listed = new Date(l.listedDate);
      const soldDate = new Date(l.soldDate);
      const diff = (soldDate.getTime() - listed.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= 0) {
        total += diff;
        count++;
      }
    }
  }
  return count > 0 ? total / count : 0;
}

// ─── Revenue Over Time (Monthly) ───────────────────────────────────────────

export function revenueByMonth(listings: VendooListing[]): ChartDataPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldDate);
  const map = new Map<string, { revenue: number; profit: number; count: number }>();

  for (const l of sold) {
    const d = new Date(l.soldDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key) || { revenue: 0, profit: 0, count: 0 };
    const profit = l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses;
    existing.revenue += l.priceSold;
    existing.profit += profit;
    existing.count += 1;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]) => ({
      name: formatMonthLabel(key),
      value: round(val.revenue),
      revenue: round(val.revenue),
      profit: round(val.profit),
      sales: val.count,
    }));
}

function formatMonthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

// ─── Sales by Platform ──────────────────────────────────────────────────────

export function salesByPlatform(listings: VendooListing[]): ChartDataPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.soldPlatform);
  const map = new Map<string, { revenue: number; count: number; profit: number }>();

  for (const l of sold) {
    const platform = l.soldPlatform;
    const existing = map.get(platform) || { revenue: 0, count: 0, profit: 0 };
    const profit = l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses;
    existing.revenue += l.priceSold;
    existing.count += 1;
    existing.profit += profit;
    map.set(platform, existing);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([name, val]) => ({
      name,
      value: round(val.revenue),
      revenue: round(val.revenue),
      profit: round(val.profit),
      sales: val.count,
    }));
}

// ─── Top Brands ─────────────────────────────────────────────────────────────

export function topBrands(listings: VendooListing[], limit = 15): ChartDataPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.brand);
  const map = new Map<string, { revenue: number; count: number; profit: number }>();

  for (const l of sold) {
    const brand = l.brand;
    const existing = map.get(brand) || { revenue: 0, count: 0, profit: 0 };
    const profit = l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses;
    existing.revenue += l.priceSold;
    existing.count += 1;
    existing.profit += profit;
    map.set(brand, existing);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([name, val]) => ({
      name,
      value: round(val.revenue),
      revenue: round(val.revenue),
      profit: round(val.profit),
      sales: val.count,
    }));
}

// ─── Category Breakdown ─────────────────────────────────────────────────────

export function salesByCategory(listings: VendooListing[]): ChartDataPoint[] {
  const sold = listings.filter((l) => l.status === "Sold" && l.category);
  const map = new Map<string, { revenue: number; count: number; profit: number }>();

  for (const l of sold) {
    const cat = l.category;
    const existing = map.get(cat) || { revenue: 0, count: 0, profit: 0 };
    const profit = l.priceSold - l.costOfGoods - l.marketplaceFees - l.shippingExpenses;
    existing.revenue += l.priceSold;
    existing.count += 1;
    existing.profit += profit;
    map.set(cat, existing);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([name, val]) => ({
      name,
      value: round(val.revenue),
      revenue: round(val.revenue),
      profit: round(val.profit),
      sales: val.count,
    }));
}

// ─── Status Distribution ────────────────────────────────────────────────────

export function statusDistribution(listings: VendooListing[]): ChartDataPoint[] {
  const map = new Map<string, number>();
  for (const l of listings) {
    map.set(l.status, (map.get(l.status) || 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

// ─── Listings Over Time ─────────────────────────────────────────────────────

export function listingsByMonth(listings: VendooListing[]): ChartDataPoint[] {
  const withDate = listings.filter((l) => l.listedDate);
  const map = new Map<string, number>();

  for (const l of withDate) {
    const d = new Date(l.listedDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({
      name: formatMonthLabel(key),
      value,
      listings: value,
    }));
}

// ─── Profit Breakdown (for waterfall-style display) ─────────────────────────

export function profitBreakdown(listings: VendooListing[]) {
  const sold = listings.filter((l) => l.status === "Sold");
  const revenue = round(sold.reduce((s, l) => s + l.priceSold, 0));
  const cogs = round(sold.reduce((s, l) => s + l.costOfGoods, 0));
  const fees = round(sold.reduce((s, l) => s + l.marketplaceFees, 0));
  const shipping = round(sold.reduce((s, l) => s + l.shippingExpenses, 0));
  const profit = round(revenue - cogs - fees - shipping);

  return [
    { name: "Revenue", value: revenue, fill: "#6366f1" },
    { name: "COGS", value: -cogs, fill: "#ef4444" },
    { name: "Fees", value: -fees, fill: "#f97316" },
    { name: "Shipping", value: -shipping, fill: "#eab308" },
    { name: "Net Profit", value: profit, fill: "#22c55e" },
  ];
}

// ─── Recent Sales ───────────────────────────────────────────────────────────

export function recentSales(listings: VendooListing[], limit = 20): VendooListing[] {
  return listings
    .filter((l) => l.status === "Sold" && l.soldDate)
    .sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime())
    .slice(0, limit);
}
