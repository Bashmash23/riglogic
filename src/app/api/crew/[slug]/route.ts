// GET /api/crew/[slug] — single crew profile, response shape depends
// on viewer: owner gets the full profile; others get the masked
// public shape when the Pro gate is on. See src/lib/crewGate.ts.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getProfileBySlug } from "@/lib/crewQueries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  try {
    const { userId } = await auth();
    // Fetch the viewer's tier if they're signed in, so the gate
    // can let Pro users through.
    let viewerTier: "free" | "pro" | null = null;
    if (userId) {
      const viewerRow = await prisma.crewProfile.findUnique({
        where: { userId },
        select: { tier: true },
      });
      viewerTier = viewerRow?.tier === "pro" ? "pro" : "free";
    }
    const profile = await getProfileBySlug(slug, {
      userId,
      tier: viewerTier,
    });
    if (!profile) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (err) {
    console.error(`GET /api/crew/${slug} failed`, err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 },
    );
  }
}
