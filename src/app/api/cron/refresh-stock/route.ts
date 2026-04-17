import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeLensman } from "@/lib/scrapers/lensman";
import { scrapeWoo } from "@/lib/scrapers/woo";
import {
  filmquipConfig,
  actionFilmzConfig,
  gearboxConfig,
} from "@/lib/scrapers/configs";
import type { ScrapedItem, ScraperResult } from "@/lib/scrapers/types";

// Run on Node runtime (cheerio + Prisma aren't Edge-compatible) and let the
// request run up to 60s (max on Vercel Hobby + Cron).
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Daily cron: visits each rental house's public catalog, upserts what's in
 * stock, and marks anything we didn't see this run as out-of-stock.
 * Triggered by Vercel Cron (see vercel.json) at 10 AM UAE.
 * Can also be invoked manually with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: NextRequest) {
  // Auth. Vercel Cron attaches Authorization: Bearer $CRON_SECRET automatically.
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET env var not set on the server" },
      { status: 500 },
    );
  }
  if (auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  // Kick all scrapers off in parallel. Each catches its own errors and returns
  // a ScraperResult with `.error` populated if something went wrong, so one
  // site failing won't poison the others.
  const results: ScraperResult[] = await Promise.all([
    scrapeLensman().catch((e) => fail("lensman", e)),
    scrapeWoo(filmquipConfig).catch((e) => fail("filmquip", e)),
    scrapeWoo(gearboxConfig).catch((e) => fail("gearbox", e)),
    scrapeWoo(actionFilmzConfig).catch((e) => fail("actionfilmz", e)),
  ]);

  const now = new Date();
  const perHouse: Record<
    string,
    { scraped: number; upserted: number; markedOut: number; error?: string }
  > = {};

  for (const result of results) {
    const house = result.sourceHouse;
    perHouse[house] = {
      scraped: result.items.length,
      upserted: 0,
      markedOut: 0,
      error: result.error,
    };
    if (result.error && result.items.length === 0) continue;

    // Upsert in small parallel batches to avoid connection pool exhaustion.
    const BATCH_SIZE = 15;
    for (let i = 0; i < result.items.length; i += BATCH_SIZE) {
      const batch = result.items.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((it) => upsertItem(it, now)));
      perHouse[house].upserted += batch.length;
    }

    // Anything in the DB for this house that we didn't see this run:
    // mark as out-of-stock, but keep the row so the product page link
    // stays reachable from historical projects.
    const seenIds = result.items.map((it) => it.externalId);
    const marked = await prisma.scrapedGear.updateMany({
      where: {
        sourceHouse: house,
        inStock: true,
        externalId: { notIn: seenIds.length > 0 ? seenIds : ["__none__"] },
      },
      data: { inStock: false, lastSeen: now },
    });
    perHouse[house].markedOut = marked.count;
  }

  return NextResponse.json({
    ok: true,
    runDurationMs: Date.now() - startedAt,
    perHouse,
    timings: Object.fromEntries(
      results.map((r) => [r.sourceHouse, { ms: r.durationMs, pages: r.pagesFetched }]),
    ),
  });
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

function fail(sourceHouse: string, err: unknown): ScraperResult {
  return {
    sourceHouse,
    items: [],
    pagesFetched: 0,
    durationMs: 0,
    error: err instanceof Error ? err.message : String(err),
  };
}
