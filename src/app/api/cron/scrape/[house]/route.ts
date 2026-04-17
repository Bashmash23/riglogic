import { NextRequest, NextResponse } from "next/server";
import { runHouse, ALL_HOUSES, bearerAuth, type HouseKey } from "@/lib/scrapers/runHouse";

// Per-house scrape endpoint. Each gets its own 60s serverless budget so the
// slow sites don't starve the fast ones. The main cron dispatcher
// (/api/cron/refresh-stock) fans out to all four in parallel.

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ house: string }> },
) {
  if (!bearerAuth(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { house } = await ctx.params;
  if (!ALL_HOUSES.includes(house as HouseKey)) {
    return NextResponse.json(
      { ok: false, error: `unknown house "${house}"` },
      { status: 404 },
    );
  }

  const report = await runHouse(house as HouseKey);
  return NextResponse.json({ ok: !report.error, report });
}
