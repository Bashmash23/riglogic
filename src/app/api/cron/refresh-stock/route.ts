import { NextRequest, NextResponse } from "next/server";
import { ALL_HOUSES, bearerAuth } from "@/lib/scrapers/runHouse";

// Daily cron dispatcher.
// Fans out to /api/cron/scrape/<house> for each rental house — each of those
// gets its own 60s Vercel serverless budget, so this dispatcher only needs
// to wait for all four in parallel (not run them sequentially itself).

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!bearerAuth(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const origin = new URL(req.url).origin;
  const secret = process.env.CRON_SECRET!;

  // Fire all four in parallel. Each child request has its own 60s runtime;
  // we cap the dispatcher at ~55s overall so Vercel's gateway doesn't 504
  // this one for slow children.
  const results = await Promise.allSettled(
    ALL_HOUSES.map((house) => scrapeWithTimeout(origin, house, secret, 55_000)),
  );

  const perHouse = ALL_HOUSES.map((house, i) => {
    const r = results[i];
    if (r.status === "fulfilled") return r.value;
    return { sourceHouse: house, error: String(r.reason) };
  });

  return NextResponse.json({
    ok: true,
    dispatcherDurationMs: Date.now() - startedAt,
    perHouse,
  });
}

async function scrapeWithTimeout(
  origin: string,
  house: string,
  secret: string,
  timeoutMs: number,
): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${origin}/api/cron/scrape/${house}`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: controller.signal,
      cache: "no-store",
    });
    const json = (await res.json()) as Record<string, unknown>;
    return { sourceHouse: house, status: res.status, ...json };
  } catch (e) {
    return {
      sourceHouse: house,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(timer);
  }
}
