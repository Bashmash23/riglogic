// Shared types for rental-house scrapers.

export interface ScrapedItem {
  /** Stable short key for the source, e.g. "gearbox" | "lensman". */
  sourceHouse: string;
  /** Site-specific id used for dedup (Shopify product id, Woo slug, etc.). */
  externalId: string;
  /** Canonical URL to the product page, used for "Check availability" links. */
  sourceUrl: string;
  /** Product title as advertised on the source site. */
  name: string;
  /** Best-effort category derived from tags / URL / product_type. */
  category: string | null;
  /** Day rate in AED, rounded to whole dirhams. Null if unknown. */
  priceAED: number | null;
  /** True when the site marks the item as available right now. */
  inStock: boolean;
  /** Absolute image URL if one was found. */
  imageUrl: string | null;
}

export interface ScraperResult {
  sourceHouse: string;
  items: ScrapedItem[];
  pagesFetched: number;
  durationMs: number;
  error?: string;
}

export type Scraper = () => Promise<ScraperResult>;

/**
 * Shared fetch wrapper — sets a real User-Agent, obeys a timeout, and throws
 * with the status code on non-2xx so upstream catches can count failures.
 */
export async function fetchText(
  url: string,
  timeoutMs: number = 12000,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; RigLogic/0.1; +https://riglogic.vercel.app)",
        accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Parse a price string like "AED 250", "250.00", "د.إ 250", "From 250". */
export function parsePriceAED(raw: string | null | undefined): number | null {
  if (!raw) return null;
  // Strip non-digit / dot / comma characters.
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(/,/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  if (!isFinite(n) || n <= 0) return null;
  return Math.round(n);
}
