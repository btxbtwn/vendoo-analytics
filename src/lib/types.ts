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
