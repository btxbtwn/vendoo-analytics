import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { VendooListing } from "./types";
import { ParseWarning, warn } from "./parse-warnings";

let cachedListings: VendooListing[] | null = null;
let cachedWarnings: ParseWarning[] | null = null;
let cachedCsvMtimeMs: number | null = null;

function parseNumber(value: string): number {
  if (!value || value.trim() === "") {
    return 0;
  }
  const cleaned = value.trim().replace(/^[$]/, "").replace(/,/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseNumberWithWarning(
  rowIndex: number,
  field: string,
  value: string,
): { num: number; warning: ParseWarning | null } {
  if (!value || value.trim() === "") return { num: 0, warning: null };
  const cleaned = value.trim().replace(/^[$]/, "").replace(/,/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) {
    return { num: 0, warning: warn(rowIndex + 2, field, value, "Not a valid number — coerced to 0") };
  }
  return { num: parsed, warning: null };
}

function parseStatus(raw: string): VendooListing["status"] {
  const valid = ["Active", "Sold", "Draft"];
  const trimmed = raw.trim();
  if (valid.includes(trimmed)) return trimmed as VendooListing["status"];
  return "Draft";
}

function getCsvPath(): string {
  const primary = path.join(process.cwd(), "public", "data", "vendoo.csv");
  const sample = path.join(process.cwd(), "public", "data", "vendoo.sample.csv");
  try {
    require("node:fs").accessSync(primary);
    return primary;
  } catch {
    return sample;
  }
}

export async function getServerListingsCsvMetadata() {
  const csvPath = getCsvPath();
  const stats = await stat(csvPath);

  return {
    csvPath,
    modifiedAt: stats.mtime,
    modifiedAtMs: stats.mtimeMs,
  };
}

export async function loadServerListings(): Promise<VendooListing[]> {
  const { listings } = await loadServerListingsWithWarnings();
  return listings;
}

export async function loadServerListingsWithWarnings(): Promise<{
  listings: VendooListing[];
  warnings: ParseWarning[];
}> {
  const { csvPath, modifiedAtMs } = await getServerListingsCsvMetadata();

  if (cachedListings && cachedCsvMtimeMs === modifiedAtMs) {
    return { listings: cachedListings, warnings: cachedWarnings ?? [] };
  }

  const csvText = await readFile(csvPath, "utf8");
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const warnings: ParseWarning[] = [];

  cachedListings = results.data.map((row, i) => {
    const rowIndex = i;

    // Financial fields with warning collection
    const priceResult = parseNumberWithWarning(rowIndex, "Price", row.Price || "");
    const priceSoldResult = parseNumberWithWarning(rowIndex, "Price Sold", row["Price Sold"] || "");
    const cogsResult = parseNumberWithWarning(rowIndex, "Cost of Goods", row["Cost of Goods"] || "");
    const feesResult = parseNumberWithWarning(rowIndex, "Marketplace Fees", row["Marketplace Fees"] || "");
    const shippingResult = parseNumberWithWarning(rowIndex, "Shipping Expenses", row["Shipping Expenses"] || "");

    if (priceResult.warning) warnings.push(priceResult.warning);
    if (priceSoldResult.warning) warnings.push(priceSoldResult.warning);
    if (cogsResult.warning) warnings.push(cogsResult.warning);
    if (feesResult.warning) warnings.push(feesResult.warning);
    if (shippingResult.warning) warnings.push(shippingResult.warning);

    // Validate date formats
    const listedDate = row["Listed Date"] || "";
    const soldDate = row["Sold Date"] || "";
    for (const [field, value] of [["Listed Date", listedDate], ["Sold Date", soldDate]] as const) {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        warnings.push(warn(rowIndex + 2, field, value, "Date is not YYYY-MM-DD — excluded from date-filtered analytics"));
      }
    }

    // Validate status
    const status = parseStatus(row.Status || "");
    if (row.Status && !["Active", "Sold", "Draft"].includes(row.Status.trim())) {
      warnings.push(warn(rowIndex + 2, "Status", row.Status, `Unknown status "${row.Status.trim()}" — treated as Draft`));
    }

    return {
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
      price: priceResult.num,
      status,
      listedDate,
      soldDate,
      shippedDate: row["Shipped Date"] || "",
      listingPlatforms: row["Listing Platforms"] || "",
      soldPlatform: row["Sold Platform"] || "",
      internalNotes: row["Internal Notes"] || "",
      priceSold: priceSoldResult.num,
      costOfGoods: cogsResult.num,
      marketplaceFees: feesResult.num,
      shippingExpenses: shippingResult.num,
      labels: row.Labels || "",
      quantityLeft: parseNumber(row["Quantity Left"] || ""),
      quantitySold: parseNumber(row["Quantity Sold"] || ""),
    };
  });

  cachedWarnings = warnings;
  cachedCsvMtimeMs = modifiedAtMs;

  return { listings: cachedListings, warnings };
}
