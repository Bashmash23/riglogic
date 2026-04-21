// /crew/[slug] — public freelancer profile page. Server-rendered
// so Googlebot indexes the content directly. Contact details are
// gated server-side: when CREW_PREMIUM_GATE_ENABLED flips on,
// email/phone/availability/CV are stripped for free viewers and a
// "sign in / upgrade" CTA shows instead.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import {
  Mail,
  Phone,
  MapPin,
  FileDown,
  ExternalLink,
  Link as LinkIcon,
  Globe,
  Film,
  Briefcase,
  ArrowLeft,
  Pencil,
  Lock,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { getProfileBySlug } from "@/lib/crewQueries";
import { prisma } from "@/lib/db";
import { CREW_PREMIUM_GATE_ENABLED } from "@/lib/crewGate";
import type { CrewProfileFull, SocialLinks } from "@/lib/crewTypes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Cheap read — we only need the name for the <title>. Contact
  // fields are irrelevant at metadata generation time.
  const row = await prisma.crewProfile
    .findUnique({
      where: { slug },
      select: {
        displayName: true,
        headline: true,
        roles: true,
        city: true,
        bio: true,
        photoUrl: true,
        isPublished: true,
      },
    })
    .catch(() => null);
  if (!row || !row.isPublished) {
    return { title: "Not found — RigLogic Crew" };
  }
  const desc = row.bio
    ? row.bio.slice(0, 160)
    : [row.headline, row.roles.slice(0, 3).join(", "), row.city]
        .filter(Boolean)
        .join(" · ");
  return {
    title: `${row.displayName} — RigLogic Crew`,
    description: desc || `${row.displayName} on RigLogic Crew`,
    openGraph: {
      title: row.displayName,
      description: desc,
      images: row.photoUrl ? [row.photoUrl] : undefined,
    },
  };
}

export default async function CrewProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();
  // Viewer's tier — needed for the gate to let Pro viewers in.
  let viewerTier: "free" | "pro" | null = null;
  if (userId) {
    try {
      const row = await prisma.crewProfile.findUnique({
        where: { userId },
        select: { tier: true },
      });
      viewerTier = row?.tier === "pro" ? "pro" : "free";
    } catch {
      /* ignore */
    }
  }

  const profile = await getProfileBySlug(slug, {
    userId,
    tier: viewerTier,
  });
  if (!profile) notFound();

  // Is the viewer the owner of this profile?
  const ownRow = userId
    ? await prisma.crewProfile
        .findUnique({ where: { userId }, select: { slug: true } })
        .catch(() => null)
    : null;
  const isOwner = ownRow?.slug === slug;

  // The shape helper already decided whether to include contact
  // fields (runs canViewContactDetails server-side with the real
  // ownerUserId). We just check which shape came back by looking
  // for a key that only exists on CrewProfileFull.
  const full: CrewProfileFull | null =
    "email" in profile ? (profile as CrewProfileFull) : null;

  return (
    <div className="flex flex-1 flex-col">
      <TopNav />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/crew"
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200"
          >
            <ArrowLeft size={12} />
            All crew
          </Link>
          {isOwner && (
            <Link
              href="/crew/me"
              className="inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700"
            >
              <Pencil size={11} />
              Edit your profile
            </Link>
          )}
        </div>

        {/* Hero */}
        <section className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[240px_1fr]">
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 aspect-square sm:aspect-auto">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt={profile.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-4xl font-semibold text-accent">
                {profile.displayName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase() ?? "")
                  .join("")}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              {profile.tier === "pro" && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-950">
                  Pro
                </span>
              )}
              {profile.city && (
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                  <MapPin size={11} />
                  {profile.city}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {profile.displayName}
            </h1>
            {profile.headline && (
              <p className="mt-2 text-lg text-neutral-400">
                {profile.headline}
              </p>
            )}
            {profile.roles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bio */}
        {profile.bio && (
          <section className="mt-12">
            <SectionHeading>About</SectionHeading>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
              {profile.bio}
            </p>
          </section>
        )}

        {/* Portfolio */}
        {profile.portfolioLinks.length > 0 && (
          <section className="mt-12">
            <SectionHeading>Portfolio</SectionHeading>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {profile.portfolioLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm hover:border-neutral-700"
                >
                  <span className="truncate text-neutral-200">
                    {link.label}
                  </span>
                  <ExternalLink
                    size={12}
                    className="shrink-0 text-neutral-500 group-hover:text-neutral-300"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Socials */}
        {hasAnySocial(profile.socialLinks) && (
          <section className="mt-12">
            <SectionHeading>Elsewhere</SectionHeading>
            <div className="mt-3 flex flex-wrap gap-2">
              <SocialChip
                icon={<Globe size={12} />}
                label="Website"
                href={profile.socialLinks.website}
              />
              <SocialChip
                icon={<LinkIcon size={12} />}
                label="Instagram"
                href={profile.socialLinks.instagram}
              />
              <SocialChip
                icon={<Film size={12} />}
                label="Behance"
                href={profile.socialLinks.behance}
              />
              <SocialChip
                icon={<Film size={12} />}
                label="Vimeo"
                href={profile.socialLinks.vimeo}
              />
              <SocialChip
                icon={<Film size={12} />}
                label="YouTube"
                href={profile.socialLinks.youtube}
              />
              <SocialChip
                icon={<Film size={12} />}
                label="IMDb"
                href={profile.socialLinks.imdb}
              />
              <SocialChip
                icon={<Briefcase size={12} />}
                label="LinkedIn"
                href={profile.socialLinks.linkedin}
              />
            </div>
          </section>
        )}

        {/* Contact — gated */}
        <section className="mt-12">
          <SectionHeading>Contact &amp; availability</SectionHeading>
          {full ? (
            <div className="mt-3 space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
              {full.email && (
                <ContactRow
                  icon={<Mail size={14} />}
                  label="Email"
                  href={`mailto:${full.email}`}
                  value={full.email}
                />
              )}
              {full.phone && (
                <ContactRow
                  icon={<Phone size={14} />}
                  label="Phone"
                  href={`tel:${full.phone}`}
                  value={full.phone}
                />
              )}
              {full.availabilityText && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Availability
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-300">
                    {full.availabilityText}
                  </p>
                </div>
              )}
              {full.cvUrl && (
                <a
                  href={full.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-soft"
                >
                  <FileDown size={12} />
                  Download CV{full.cvFileName ? ` (${full.cvFileName})` : ""}
                </a>
              )}
              {!full.email &&
                !full.phone &&
                !full.availabilityText &&
                !full.cvUrl && (
                  <p className="text-sm text-neutral-500">
                    This freelancer hasn&rsquo;t added contact details yet.
                  </p>
                )}
            </div>
          ) : (
            <ProGate />
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// --- small building blocks -----------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
      {children}
    </h2>
  );
}

function ContactRow({
  icon,
  label,
  href,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <a
        href={href}
        className="mt-1 inline-flex items-center gap-1.5 text-sm text-neutral-200 hover:text-accent"
      >
        {icon}
        {value}
      </a>
    </div>
  );
}

function SocialChip({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string | undefined;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-700"
    >
      {icon}
      {label}
    </a>
  );
}

function hasAnySocial(s: SocialLinks) {
  return Object.values(s).some((v) => typeof v === "string" && v.length > 0);
}

function ProGate() {
  // Only rendered when CREW_PREMIUM_GATE_ENABLED = true and the
  // viewer doesn't pass. Currently the flag is off so this is
  // dormant — but living in one place means flipping the gate
  // just works without UI churn.
  return (
    <div className="mt-3 rounded-lg border border-dashed border-neutral-800 bg-neutral-900/30 p-6 text-center">
      <Lock size={20} className="mx-auto text-accent" />
      <p className="mt-3 text-sm font-medium text-neutral-200">
        Contact details are part of Pro
      </p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
        Upgrade to Pro to email, call, or download the CV. Freelancers
        keep their profile free forever — only productions pay.
      </p>
      {CREW_PREMIUM_GATE_ENABLED && (
        <Link
          href="/listing"
          className="mt-4 inline-flex rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-soft"
        >
          Get Pro access
        </Link>
      )}
    </div>
  );
}
