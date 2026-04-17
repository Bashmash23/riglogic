// Shared routine for scraping one rental house and persisting the result.
// Called from both the per-house cron endpoints and (hypothetically) any
// manual re-scrape endpoint we add later.

import { prisma } from "@/lib/db";
import type { ScrapedItem, ScraperResult } from "./types";
import { scrapeLensman } from "./lensman";
import { scrapeWoo } from "./woo";
import { filmquipConfig, gearboxConfig, actionFilmzConfig } from "./configs";

export type HouseKey = "lensman" | "gearbox" | "filmquip" | "actionfilmz";

export const ALL_HOUSES: HouseKey[] = [
  "lensman",
  "gearbox",
  "filmquip",
  "actionfilmz",
];

async function runScraper(house: HouseKey): Promise<ScraperResult> {
  switch (house) {
    case "lensman":
      return scrapeLensman();
    case "filmquip":
      return scrapeWoo(filmquipConfig);
    case "gearbox":
      return scrapeWoo(gearboxConfig);
    case "actionfilmz":
      return scrapeWoo(actionFilmzConfig);
  }
}

export interface HouseRunReport {
  sourceHouse: string;
  scraped: number;
  upserted: number;
  markedOut: number;
  pagesFetched: number;
  durationMs: number;
  error?: string;
}

export async function runHouse(house: HouseKey): Promise<HouseRunReport> {
  const result = await runScraper(house).catch((e): ScraperResult => ({
    sourceHouse: house,
    items: [],
    pagesFetched: 0,
    durationMs: 0,
    error: e instanceof Error ? e.message : String(e),
  }));

  const now = new Date();
  let upserted = 0;

  // Bail early on hard failure with no items — don't wipe the DB for this
  // house just because a scrape run failed.
  if (result.error && result.items.length === 0) {
    return {
      sourceHouse: house,
      scraped: 0,
      upserted: 0,
      markedOut: 0,
      pagesFetched: result.pagesFetched,
      durationMs: result.durationMs,
      error: result.error,
    };
  }

  // Batched upsert.
  const BATCH_SIZE = 20;
  for (let i = 0; i < result.items.length; i += BATCH_SIZE) {
    const batch = result.items.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((it) => upsertItem(it, now)));
    upserted += batch.length;
  }

  // Items in our DB for this house that we didn't see this run → out of stock.
  const seenIds = result.items.map((it) => it.externalId);
  const marked = await prisma.scrapedGear.updateMany({
    where: {
      sourceHouse: house,
      inStock: true,
      externalId: { notIn: seenIds.length > 0 ? seenIds : ["__none__"] },
    },
    data: { inStock: false, lastSeen: now },
  });

  return {
    sourceHouse: house,
    scraped: result.items.length,
    upserted,
    markedOut: marked.count,
    pagesFetched: result.pagesFetched,
    durationMs: result.durationMs,
    error: result.error,
  };
}

async function upsertItem(it: ScrapedItem, now: Date) {
  try {
    await prisma.scrapedGear.upsert({
      where: {
        sourceHouse_externalId: {
          sourceHouse: it.sourceHouse,
          externalId: it.externalId,
        },
      },
      create: {
        sourceHouse: it.sourceHouse,
        externalId: it.externalId,
        sourceUrl: it.sourceUrl,
        name: it.name,
        category: it.category,
        priceAED: it.priceAED,
        inStock: it.inStock,
        imageUrl: it.imageUrl,
        lastSeen: now,
      },
      update: {
        sourceUrl: it.sourceUrl,
        name: it.name,
        category: it.category,
        priceAED: it.priceAED,
        inStock: it.inStock,
        imageUrl: it.imageUrl,
        lastSeen: now,
      },
    });
  } catch {
    // Swallow per-row failures so one bad record doesn't kill the run.
  }
}

export function bearerAuth(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}
