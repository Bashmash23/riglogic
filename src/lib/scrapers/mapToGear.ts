// Convert a ScrapedGear row from Postgres into a GearItem the builder UI
// understands. The UI treats placeholder and scraped items identically, so
// we have to synthesize sensible values for the GearItem fields the scrape
// doesn't give us (category enum, tags, isPrimary, blurb).

import type { Category, GearItem } from "../types";

interface ScrapedRow {
  sourceHouse: string;
  externalId: string;
  sourceUrl: string;
  name: string;
  category: string | null;
  priceAED: number | null;
  inStock: boolean;
  imageUrl: string | null;
}

/**
 * Best-effort mapping from a free-text category/name to our fixed Category
 * enum. Inspection order matters — the first keyword that hits wins.
 */
function inferCategory(text: string): Category {
  const t = text.toLowerCase();
  if (/(camera|body|mirrorless|dslr|alexa|venice|komodo|raptor|fx[369]|c70|c300|c500)/.test(t))
    return "Cameras";
  if (/(lens|prime|zoom|anamorph|tele|wide|macro|\d+mm)/.test(t)) return "Lenses";
  if (/(light|led|hmi|kino|skypanel|aputure|nanlite|litepanel|rgb|tube|spot|softbox|par)/.test(t))
    return "Lighting";
  if (/(tripod|head|stand|c-stand|dolly|slider|gimbal|shoulder rig|cage|mount|grip|clamp|arm|reflector)/.test(t))
    return "Grip";
  if (/(mic|microphone|boom|recorder|mixpre|sennheiser|rode|blimp|shotgun|lav|wireless audio|zoom h)/.test(t))
    return "Audio";
  if (/(monitor|teradek|bolt|smallhd|atomos|shogun|directors? finder|evf)/.test(t))
    return "Monitoring";
  if (/(battery|v-?mount|gold mount|charger|generator|inverter|ac adapter|power|psu)/.test(t))
    return "Power";
  if (/(cfexpress|sd card|xqd|ssd|codex|magazine|hard drive|usb drive|nvme)/.test(t))
    return "Media";
  return "Accessories";
}

/**
 * Derive a handful of tags from the name so search still matches on brand /
 * model keywords. Cheap — just splits the name on non-word characters.
 */
function deriveTags(name: string, sourceHouse: string): string[] {
  const tokens = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && t.length <= 20);
  return Array.from(new Set([sourceHouse, ...tokens])).slice(0, 12);
}

/** Stable prefix so scraped IDs can't collide with placeholder gear.json IDs. */
export function scrapedGearId(sourceHouse: string, externalId: string): string {
  return `scraped_${sourceHouse}_${externalId}`;
}

export function scrapedRowToGearItem(row: ScrapedRow): GearItem {
  const category = inferCategory(`${row.category ?? ""} ${row.name}`);
  return {
    id: scrapedGearId(row.sourceHouse, row.externalId),
    name: row.name,
    category,
    dayRateAED: row.priceAED ?? 0,
    rentalHouseId: row.sourceHouse,
    tags: deriveTags(row.name, row.sourceHouse),
    isPrimary: category === "Cameras",
    blurb: `Live from ${row.sourceHouse}. ${row.inStock ? "In stock" : "Currently out of stock"}.`,
    imageUrl: row.imageUrl,
  };
}
