export interface VendooListing {
  images: string;
  title: string;
  description: string;
  brand: string;
  condition: string;
  primaryColor: string;
  secondaryColor: string;
  tags: string;
  sku: string;
  category: string;
  price: number;
  status: "Active" | "Sold" | "Draft";
  listedDate: string;
  soldDate: string;
  shippedDate: string;
  listingPlatforms: string;
  soldPlatform: string;
  internalNotes: string;
  priceSold: number;
  costOfGoods: number;
  marketplaceFees: number;
  shippingExpenses: number;
  labels: string;
  quantityLeft: number;
  quantitySold: number;
}

export interface KPI {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export type DashboardTabKey = "overview" | "revenue" | "platforms" | "inventory" | "brands";

export type ComparisonDimension = "labels" | "tags";

export type ComparisonMetric = "sales" | "revenue" | "profit";

export type DateFilterPreset = "all" | "7d" | "14d" | "30d" | "60d" | "90d" | "custom";

export type DateField = "soldDate" | "listedDate";

export type TimeGrouping = "day" | "month";

export interface TabDateFilter {
  preset: DateFilterPreset;
  from: string;
  to: string;
}

export interface SegmentComparisonPoint extends ChartDataPoint {
  sales: number;
  revenue: number;
  profit: number;
  listed: number;
  sellThrough: number;
}

export interface SegmentPlatformMetrics {
  sales: number;
  revenue: number;
  profit: number;
}

export interface SegmentPlatformComparisonPoint {
  name: string;
  sales: number;
  revenue: number;
  profit: number;
  platforms: Record<string, SegmentPlatformMetrics>;
}

export interface ProjectionPoint {
  name: string;
  dateKey: string;
  actualRevenue: number | null;
  projectedRevenue: number | null;
  actualProfit: number | null;
  projectedProfit: number | null;
}

export interface ProjectionSummary {
  actualRevenue: number;
  actualProfit: number;
  averageDailyRevenue: number;
  averageDailyProfit: number;
  projectedRevenue: number;
  projectedProfit: number;
}

export interface SellThroughPoint {
  category: string;
  listed: number;
  sold: number;
  rate: number;
}

export interface ProfitDistributionPoint {
  bucket: string;
  count: number;
  profit: number;
}

export interface DaysToSellPoint {
  bucket: string;
  count: number;
  minDays: number;
  maxDays: number;
}

export interface PlatformFeePoint {
  platform: string;
  avgFeeRate: number;
  avgProfitRate: number;
  totalRevenue: number;
  count: number;
}

export interface BrandROIPoint {
  brand: string;
  roi: number;
  profit: number;
  cogs: number;
  revenue: number;
  count: number;
}

export interface MonthlyPnLPoint {
  month: string;
  revenue: number;
  cogs: number;
  fees: number;
  shipping: number;
  profit: number;
}

export interface InventoryCostSummary {
  totalInvestment: number;
  realizedRevenue: number;
  realizedProfit: number;
  activeInventoryCost: number;
  inventoryROI: number;
  soldCount: number;
  activeCount: number;
  totalCount: number;
}

export interface CategoryBreakdownRow {
  category: string;
  listed: number;
  sold: number;
  sellThroughRate: number;
  avgCOGS: number;
  avgSalePrice: number;
  avgProfit: number;
  profitMargin: number;
  totalRevenue: number;
  totalProfit: number;
  totalCOGS: number;
}

export type SortDirection = "asc" | "desc";

export interface InventoryTableRow {
  id: string;
  title: string;
  brand: string;
  category: string;
  status: "Active" | "Sold" | "Draft";
  costOfGoods: number;
  price: number;
  priceSold: number;
  profit: number;
  marketplaceFees: number;
  shippingExpenses: number;
  daysToSell: number | null;
  platform: string;
  listedDate: string;
  soldDate: string;
}

export type InventorySortField =
  | "title"
  | "brand"
  | "category"
  | "status"
  | "costOfGoods"
  | "priceSold"
  | "profit"
  | "daysToSell"
  | "listedDate"
  | "soldDate";

export type StatusFilter = "all" | "Active" | "Sold" | "Draft";
