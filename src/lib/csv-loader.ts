import Papa from "papaparse";
import { VendooListing } from "./types";

function parseNumber(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export async function loadListings(): Promise<VendooListing[]> {
  const res = await fetch("/data/vendoo.csv");
  const text = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const listings: VendooListing[] = (results.data as Record<string, string>[]).map((row) => ({
          images: row["Images"] || "",
          title: row["Title"] || "",
          description: row["Description"] || "",
          brand: row["Brand"] || "",
          condition: row["Condition"] || "",
          primaryColor: row["Primary Color"] || "",
          secondaryColor: row["Secondary Color"] || "",
          tags: row["Tags"] || "",
          sku: row["Sku"] || "",
          category: row["Category"] || "",
          price: parseNumber(row["Price"]),
          status: (row["Status"] as VendooListing["status"]) || "Draft",
          listedDate: row["Listed Date"] || "",
          soldDate: row["Sold Date"] || "",
          shippedDate: row["Shipped Date"] || "",
          listingPlatforms: row["Listing Platforms"] || "",
          soldPlatform: row["Sold Platform"] || "",
          internalNotes: row["Internal Notes"] || "",
          priceSold: parseNumber(row["Price Sold"]),
          costOfGoods: parseNumber(row["Cost of Goods"]),
          marketplaceFees: parseNumber(row["Marketplace Fees"]),
          shippingExpenses: parseNumber(row["Shipping Expenses"]),
          labels: row["Labels"] || "",
          quantityLeft: parseNumber(row["Quantity Left"]),
          quantitySold: parseNumber(row["Quantity Sold"]),
        }));
        resolve(listings);
      },
      error: reject,
    });
  });
}
