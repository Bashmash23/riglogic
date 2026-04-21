// Server-side query helpers for the Crew directory. Kept separate
// from API route files so both server components and API routes
// can share the same logic without duplicating response-shaping
// code.

import { prisma } from "@/lib/db";
import { canViewContactDetails, type ViewerContext } from "@/lib/crewGate";
import type {
  CrewProfileFull,
  CrewProfilePublic,
  PortfolioLink,
  SocialLinks,
} from "@/lib/crewTypes";

// Narrow Prisma row type to the fields we actually read. Avoids
// importing the full generated Prisma type into client bundles.
type CrewProfileRow = {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  roles: string[];
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  availabilityText: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  portfolioLinks: unknown;
  socialLinks: unknown;
  tier: string;
  updatedAt: Date;
};

function parsePortfolioLinks(raw: unknown): PortfolioLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is PortfolioLink =>
      typeof x === "object" &&
      x !== null &&
      typeof (x as { label?: unknown }).label === "string" &&
      typeof (x as { url?: unknown }).url === "string",
  );
}

function parseSocialLinks(raw: unknown): SocialLinks {
  if (typeof raw !== "object" || raw === null) return {};
  // Best-effort cast — SocialLinks is all-optional strings.
  return raw as SocialLinks;
}

function toPublic(row: CrewProfileRow): CrewProfilePublic {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.displayName,
    headline: row.headline,
    bio: row.bio,
    city: row.city,
    roles: row.roles,
    photoUrl: row.photoUrl,
    portfolioLinks: parsePortfolioLinks(row.portfolioLinks),
    socialLinks: parseSocialLinks(row.socialLinks),
    tier: row.tier === "pro" ? "pro" : "free",
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Apply contact-field gating and return the right shape. */
export function shapeProfile(
  row: CrewProfileRow,
  viewer: ViewerContext,
): CrewProfilePublic | CrewProfileFull {
  const pub = toPublic(row);
  const canSeeContact = canViewContactDetails(viewer, {
    ownerUserId: row.userId,
  });
  if (!canSeeContact) return pub;
  const full: CrewProfileFull = {
    ...pub,
    email: row.email,
    phone: row.phone,
    availabilityText: row.availabilityText,
    cvUrl: row.cvUrl,
    cvFileName: row.cvFileName,
  };
  return full;
}

/** Paginated list for the /crew directory grid. */
export async function listPublishedProfiles(): Promise<CrewProfilePublic[]> {
  const rows = await prisma.crewProfile.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return rows.map(toPublic);
}

/** Fetch one profile by slug, shaped for the given viewer. */
export async function getProfileBySlug(
  slug: string,
  viewer: ViewerContext,
): Promise<CrewProfilePublic | CrewProfileFull | null> {
  const row = await prisma.crewProfile.findUnique({ where: { slug } });
  if (!row || !row.isPublished) return null;
  return shapeProfile(row, viewer);
}

/** Fetch the signed-in user's own profile (full, unmasked). */
export async function getOwnProfile(
  userId: string,
): Promise<CrewProfileFull | null> {
  const row = await prisma.crewProfile.findUnique({ where: { userId } });
  if (!row) return null;
  return shapeProfile(row, {
    userId,
    tier: row.tier === "pro" ? "pro" : "free",
  }) as CrewProfileFull;
}
