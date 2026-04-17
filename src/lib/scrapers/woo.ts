// Generic WooCommerce-style scraper.
// Each instance is configured with the site's base URL and the CSS selectors
// that work against *that theme*. WooCommerce sites look similar but themers
// customize the product-loop markup; centralising the traversal here keeps
// each site's config to ~10 lines.

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { fetchText, parsePriceAED, type ScrapedItem, type ScraperResult } from "./types";

type CheerioAPI = ReturnType<typeof cheerio.load>;

export interface WooConfig {
  sourceHouse: string;
  /** Absolute URL of page 1 of the catalog. */
  firstPageUrl: string;
  /** Function that returns the URL for the Nth page (N>=2). */
  pageUrl: (n: number) => string;
  /** CSS selector that matches each product card in the list. */
  cardSelector: string;
  /** Within a card: selector for the product link (href). */
  linkSelector: string;
  /** Within a card: selector for the product title (text). */
  titleSelector: string;
  /** Within a card: selector for the price (text). Optional. */
  priceSelector?: string;
  /** Within a card: selector for the product image (src or data-src). Optional. */
  imageSelector?: string;
  /** Within a card: selector that signals "out of stock". Optional. */
  outOfStockSelector?: string;
  /** Hard cap on pages fetched, to stay under cron timeout. */
  maxPages?: number;
  /** Abort page loop if this many consecutive pages return zero products. */
  emptyPageBudget?: number;
}

function cardImage($: CheerioAPI, el: AnyNode, selector?: string): string | null {
  if (!selector) return null;
  const $img = $(el).find(selector).first();
  return (
    $img.attr("data-src") ||
    $img.attr("data-lazy-src") ||
    $img.attr("src") ||
    null
  );
}

function slugFromUrl(u: string): string {
  const m = u.match(/\/product\/([^/?#]+)\/?/);
  return m ? m[1] : u;
}

export async function scrapeWoo(cfg: WooConfig): Promise<ScraperResult> {
  const started = Date.now();
  const items: ScrapedItem[] = [];
  const seen = new Set<string>();
  const maxPages = cfg.maxPages ?? 20;
  let pagesFetched = 0;
  let consecutiveEmpty = 0;
  const emptyBudget = cfg.emptyPageBudget ?? 1;
  let error: string | undefined;

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? cfg.firstPageUrl : cfg.pageUrl(page);
      let html: string;
      try {
        html = await fetchText(url);
      } catch (e) {
        // page not found = ran past last page
        if (e instanceof Error && /HTTP 404/.test(e.message)) break;
        throw e;
      }
      pagesFetched++;
      const $ = cheerio.load(html);
      const cards = $(cfg.cardSelector).toArray();
      if (cards.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= emptyBudget) break;
        continue;
      }
      consecutiveEmpty = 0;
      let newOnPage = 0;
      for (const card of cards) {
        const $card = $(card);
        const href = $card.find(cfg.linkSelector).first().attr("href");
        const title = $card.find(cfg.titleSelector).first().text().trim();
        if (!href || !title) continue;
        const absoluteHref = href.startsWith("http")
          ? href
          : new URL(href, cfg.firstPageUrl).toString();
        const externalId = slugFromUrl(absoluteHref);
        if (seen.has(externalId)) continue;
        seen.add(externalId);
        newOnPage++;

        const priceText = cfg.priceSelector
          ? $card.find(cfg.priceSelector).first().text().trim()
          : undefined;
        const outOfStock = cfg.outOfStockSelector
          ? $card.find(cfg.outOfStockSelector).length > 0
          : false;

        items.push({
          sourceHouse: cfg.sourceHouse,
          externalId,
          sourceUrl: absoluteHref,
          name: title,
          category: null, // per-site overrides can fill this in later
          priceAED: parsePriceAED(priceText),
          inStock: !outOfStock,
          imageUrl: cardImage($, card, cfg.imageSelector),
        });
      }
      // If a whole page was duplicates (no new externalIds), we've looped.
      if (newOnPage === 0) break;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return {
    sourceHouse: cfg.sourceHouse,
    items,
    pagesFetched,
    durationMs: Date.now() - started,
    error,
  };
}
