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
