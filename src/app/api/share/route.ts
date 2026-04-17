import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SnapshotItemSchema = z.object({
  lineId: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.number().int().min(1).max(999),
  dayRateAED: z.number().nonnegative(),
  blurb: z.string(),
  house: z
    .object({
      id: z.string(),
      name: z.string(),
      website: z.string(),
    })
    .nullable(),
});

const SnapshotSchema = z.object({
  version: z.literal(1),
  projectName: z.string().max(200),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  createdByName: z.string().optional(),
  createdByEmail: z.string().optional(),
  items: z.array(SnapshotItemSchema).max(500),
  rentalDays: z.number().int().min(0).max(365),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = SnapshotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_snapshot", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { userId } = await auth();
  const shortId = nanoid(10);

  try {
    const row = await prisma.shareLink.create({
      data: {
        shortId,
        payload: parsed.data,
        createdBy: userId,
      },
    });
    return NextResponse.json({ shortId: row.shortId });
  } catch (err) {
    console.error("share.create failed", err);
    return NextResponse.json(
      { error: "db_unavailable" },
      { status: 503 },
    );
  }
}
