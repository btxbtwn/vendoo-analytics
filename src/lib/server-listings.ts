import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { VendooListing } from "./types";

let cachedListings: VendooListing[] | null = null;

function parseNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function loadServerListings(): Promise<VendooListing[]> {
  if (cachedListings) {
    return cachedListings;
  }

  const csvPath = path.join(process.cwd(), "public", "data", "vendoo.csv");
  const csvText = await readFile(csvPath, "utf8");

  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  cachedListings = results.data.map((row) => ({
    images: row.Images || "",
    title: row.Title || "",
    description: row.Description || "",
    brand: row.Brand || "",
    condition: row.Condition || "",
    primaryColor: row["Primary Color"] || "",
    secondaryColor: row["Secondary Color"] || "",
    tags: row.Tags || "",
    sku: row.Sku || "",
    category: row.Category || "",
    price: parseNumber(row.Price || ""),
    status: (row.Status as VendooListing["status"]) || "Draft",
    listedDate: row["Listed Date"] || "",
    soldDate: row["Sold Date"] || "",
    shippedDate: row["Shipped Date"] || "",
    listingPlatforms: row["Listing Platforms"] || "",
    soldPlatform: row["Sold Platform"] || "",
    internalNotes: row["Internal Notes"] || "",
    priceSold: parseNumber(row["Price Sold"] || ""),
    costOfGoods: parseNumber(row["Cost of Goods"] || ""),
    marketplaceFees: parseNumber(row["Marketplace Fees"] || ""),
    shippingExpenses: parseNumber(row["Shipping Expenses"] || ""),
    labels: row.Labels || "",
    quantityLeft: parseNumber(row["Quantity Left"] || ""),
    quantitySold: parseNumber(row["Quantity Sold"] || ""),
  }));

  return cachedListings;
}