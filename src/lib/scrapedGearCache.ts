// Tiny module-level cache so getGear() (used by KitSidebar, PDF export, share
// links, etc.) can resolve scraped gear ids without every consumer having to
// plumb the scraped catalog through props. Populated by useScrapedGear on
// the client. Lookups are a no-op on the server — the cache stays empty
// there, so server-side rendering of the placeholder catalog isn't affected.

import type { GearItem } from "./types";

let cache = new Map<string, GearItem>();

export function setScrapedGear(items: GearItem[]): void {
  const next = new Map<string, GearItem>();
  for (const item of items) next.set(item.id, item);
  cache = next;
}

export function lookupScrapedGear(id: string): GearItem | undefined {
  return cache.get(id);
}
