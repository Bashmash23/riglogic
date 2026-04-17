// Read-only catalog lookups over the placeholder JSON.
import gearJson from "@/data/gear.json";
import housesJson from "@/data/houses.json";
import type { Category, GearItem, RentalHouse } from "./types";
import { lookupScrapedGear } from "./scrapedGearCache";

export const GEAR: GearItem[] = gearJson as GearItem[];
export const HOUSES: RentalHouse[] = housesJson as RentalHouse[];

const GEAR_BY_ID = new Map(GEAR.map((item) => [item.id, item]));
const HOUSE_BY_ID = new Map(HOUSES.map((house) => [house.id, house]));

export function getGear(id: string): GearItem | undefined {
  // Placeholder catalog wins. If not found, fall back to the client-side
  // scraped-gear cache (empty on the server, populated after the first
  // /api/catalog fetch on the client).
  return GEAR_BY_ID.get(id) ?? lookupScrapedGear(id);
}

export function getHouse(id: string): RentalHouse | undefined {
  return HOUSE_BY_ID.get(id);
}

export function gearByCategory(category: Category): GearItem[] {
  return GEAR.filter((item) => item.category === category);
}

/**
 * Simple fuzzy-ish search: matches items whose name/tags/blurb contain every
 * whitespace-separated token in the query (case-insensitive).
 */
export function searchGear(query: string): GearItem[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return [];
  return GEAR.filter((item) => {
    const haystack = [
      item.name,
      item.category,
      item.blurb,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}
