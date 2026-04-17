import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email().max(320),
  source: z.enum(["crew", "pro-tier"]),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await prisma.waitlistSignup.upsert({
      where: {
        email_source: { email: parsed.data.email, source: parsed.data.source },
      },
      create: parsed.data,
      update: {}, // already on list, no-op
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("waitlist.upsert failed", err);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}
