import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> },
) {
  const { shortId } = await params;
  if (!shortId || shortId.length > 32) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  try {
    const row = await prisma.shareLink.findUnique({ where: { shortId } });
    if (!row) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    // Fire-and-forget increment; ignore errors.
    prisma.shareLink
      .update({
        where: { shortId },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});
    return NextResponse.json({ payload: row.payload });
  } catch (err) {
    console.error("share.read failed", err);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}
