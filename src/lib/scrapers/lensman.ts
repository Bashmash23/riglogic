// Lensman Express — Shopify storefront.
// Shopify exposes /collections/<handle>/products.json as a public JSON feed.

import { fetchText, parsePriceAED, type ScrapedItem, type ScraperResult } from "./types";

const COLLECTION = "https://lensmanexpress.com/collections/rental";
const PAGE_LIMIT = 250; // Shopify caps per-page at 250
const MAX_PAGES = 10; // hard cap; covers 2500 items, plenty

interface ShopifyVariant {
  available?: boolean;
  price?: string | number;
}
interface ShopifyImage {
  src?: string;
}
interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  product_type?: string;
  tags?: string[];
  variants?: ShopifyVariant[];
  images?: ShopifyImage[];
}

export async function scrapeLensman(): Promise<ScraperResult> {
  const started = Date.now();
  const items: ScrapedItem[] = [];
  let pagesFetched = 0;
  let error: string | undefined;

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `${COLLECTION}/products.json?limit=${PAGE_LIMIT}&page=${page}`;
      const raw = await fetchText(url);
      pagesFetched++;
      const parsed = JSON.parse(raw) as { products?: ShopifyProduct[] };
      const products = parsed.products ?? [];
      if (products.length === 0) break;
      for (const p of products) {
        const variant = p.variants?.[0];
        const priceStr =
          typeof variant?.price === "number"
            ? variant.price.toString()
            : variant?.price;
        items.push({
          sourceHouse: "lensman",
          externalId: String(p.id),
          sourceUrl: `https://lensmanexpress.com/products/${p.handle}`,
          name: p.title,
          category: p.product_type || (p.tags && p.tags[0]) || null,
          priceAED: parsePriceAED(priceStr),
          inStock: p.variants?.some((v) => v.available === true) ?? false,
          imageUrl: p.images?.[0]?.src ?? null,
        });
      }
      if (products.length < PAGE_LIMIT) break; // last page
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return {
    sourceHouse: "lensman",
    items,
    pagesFetched,
    durationMs: Date.now() - started,
    error,
  };
}
