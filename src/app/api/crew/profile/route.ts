// Profile CRUD for the signed-in user.
//
//   GET    /api/crew/profile  — get own profile (or 404 if none)
//   PUT    /api/crew/profile  — create or update own profile
//   DELETE /api/crew/profile  — soft-delete (sets isPublished=false)
//
// All require Clerk auth. A user can only read/write their own
// profile; slug is derived server-side so it can't be spoofed.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOwnProfile } from "@/lib/crewQueries";
import { slugify, slugifyWithSuffix } from "@/lib/crewSlug";
import type { CrewProfileInput, PortfolioLink, SocialLinks } from "@/lib/crewTypes";

export const dynamic = "force-dynamic";

// --- GET: own profile ------------------------------------------------

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  try {
    const profile = await getOwnProfile(userId);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("GET /api/crew/profile failed", err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 },
    );
  }
}

// --- PUT: upsert own profile ----------------------------------------

function sanitizeInput(body: unknown): CrewProfileInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const displayName =
    typeof b.displayName === "string" ? b.displayName.trim() : "";
  if (!displayName || displayName.length > 80) return null;
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : undefined;
  const roles = Array.isArray(b.roles)
    ? b.roles.filter((r): r is string => typeof r === "string").slice(0, 10)
    : undefined;
  const portfolioLinks = Array.isArray(b.portfolioLinks)
    ? (b.portfolioLinks
        .filter(
          (x): x is PortfolioLink =>
            typeof x === "object" &&
            x !== null &&
            typeof (x as PortfolioLink).label === "string" &&
            typeof (x as PortfolioLink).url === "string",
        )
        .slice(0, 20)
        .map((x) => ({
          label: x.label.slice(0, 40),
          url: x.url.slice(0, 500),
        })) as PortfolioLink[])
    : undefined;
  const socialLinks =
    typeof b.socialLinks === "object" && b.socialLinks !== null
      ? (b.socialLinks as SocialLinks)
      : undefined;
  return {
    displayName,
    headline: str(b.headline, 120),
    bio: str(b.bio, 2000),
    city: str(b.city, 60),
    roles,
    email: str(b.email, 120),
    phone: str(b.phone, 30),
    availabilityText: str(b.availabilityText, 1000),
    portfolioLinks,
    socialLinks,
  };
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const input = sanitizeInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "invalid_input" },
      { status: 400 },
    );
  }
  try {
    const existing = await prisma.crewProfile.findUnique({
      where: { userId },
    });
    // Slug: only generate on first create. Keep stable so old
    // shared URLs don't break when the user renames themselves.
    let slug = existing?.slug;
    if (!slug) {
      const base = slugify(input.displayName);
      const collision = await prisma.crewProfile.findUnique({
        where: { slug: base },
      });
      slug = collision ? slugifyWithSuffix(input.displayName) : base;
    }
    const row = await prisma.crewProfile.upsert({
      where: { userId },
      create: {
        userId,
        slug,
        displayName: input.displayName,
        headline: input.headline ?? null,
        bio: input.bio ?? null,
        city: input.city ?? null,
        roles: input.roles ?? [],
        email: input.email ?? null,
        phone: input.phone ?? null,
        availabilityText: input.availabilityText ?? null,
        portfolioLinks: (input.portfolioLinks ?? []) as unknown as object,
        socialLinks: (input.socialLinks ?? {}) as unknown as object,
      },
      update: {
        displayName: input.displayName,
        headline: input.headline ?? null,
        bio: input.bio ?? null,
        city: input.city ?? null,
        roles: input.roles ?? [],
        email: input.email ?? null,
        phone: input.phone ?? null,
        availabilityText: input.availabilityText ?? null,
        portfolioLinks: (input.portfolioLinks ?? []) as unknown as object,
        socialLinks: (input.socialLinks ?? {}) as unknown as object,
        isPublished: true,
      },
    });
    return NextResponse.json({ profile: { slug: row.slug } });
  } catch (err) {
    console.error("PUT /api/crew/profile failed", err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 },
    );
  }
}

// --- DELETE: unpublish profile --------------------------------------

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  try {
    await prisma.crewProfile.update({
      where: { userId },
      data: { isPublished: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // If they don't have a profile at all, treat as success.
    console.error("DELETE /api/crew/profile failed", err);
    return NextResponse.json({ ok: true });
  }
}
