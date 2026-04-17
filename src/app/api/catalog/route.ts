import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapedRowToGearItem } from "@/lib/scrapers/mapToGear";

// Read-only endpoint. Returns all in-stock scraped gear as GearItem-shaped
// objects that the builder can merge with the placeholder gear.json.
// The endpoint intentionally only returns scraped rows — the placeholder
// catalog is still bundled with the client; no need to send it over the wire.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.scrapedGear.findMany({
      where: { inStock: true },
      orderBy: { lastSeen: "desc" },
    });
    const items = rows.map((r) =>
      scrapedRowToGearItem({
        sourceHouse: r.sourceHouse,
        externalId: r.externalId,
        sourceUrl: r.sourceUrl,
        name: r.name,
        category: r.category,
        priceAED: r.priceAED,
        inStock: r.inStock,
        imageUrl: r.imageUrl,
      }),
    );
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        count: 0,
        items: [],
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 200 }, // return empty list rather than 500 so the client falls back
    );
  }
}
