"use client";

// Crew card — rebuilt to match the new mockup. Adapted to what
// the schema actually has (no rating, no shoots count, no day rate
// yet), so we focus on the visual moves we *can* express:
//
//   - Avatar (photo or initials gradient) with an "available this
//     month" green status dot if the freelancer's availability
//     calendar shows any day in the current month
//   - Name + headline
//   - Active first role chip + up to 2 inactive chips
//   - City line
//   - Primary CTA "View profile" (the card is fully clickable
//     anyway, but the explicit button reads as an affordance)
//   - Bookmark icon button on the right
//
// Stats row (rating · shoots · years exp) intentionally skipped per
// the design plan Q2 — we'll add it once we have the data.

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import { useShortlist } from "@/lib/crewShortlist";
import type { CrewProfilePublic } from "@/lib/crewTypes";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";

export const cardMotionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const;

export function CrewCard({ profile }: { profile: CrewProfilePublic }) {
  const { has, toggle, mounted } = useShortlist();
  const saved = mounted && has(profile.slug);
  const primaryRole = profile.roles[0] ?? null;
  const otherRoles = profile.roles.slice(1, 3);

  // "Available this month" dot. Cheap check against the current
  // month's first/last YYYY-MM-DD strings — same logic the
  // directory filter uses, kept inline because we need only the
  // boolean here.
  const availableThisMonth = isAvailableThisMonth(profile.availableDates);

  return (
    <motion.div
      variants={cardMotionVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-colors hover:border-neutral-700 hover:shadow-lg hover:shadow-black/30"
    >
      {/* Top row: avatar + name + bookmark button */}
      <div className="flex items-start gap-3">
        <Avatar
          name={profile.displayName}
          photoUrl={profile.photoUrl}
          available={availableThisMonth}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/crew/${profile.slug}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-neutral-100">
                {profile.displayName}
              </h3>
              {profile.tier === "pro" && (
                <span className="text-accent" title="Pro">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M6 0l1.4 1.5L9.5 1l.5 2.1L12 4l-.7 2 .7 2-2 1-.5 2.1-2.1-.5L6 12l-1.4-1.4L2.5 11 2 8.9 0 8l.7-2L0 4l2-1 .5-2.1L4.6 1.4 6 0z" />
                  </svg>
                </span>
              )}
            </div>
            {profile.headline && (
              <p className="mt-0.5 truncate text-xs text-neutral-400">
                {profile.headline}
              </p>
            )}
          </Link>
        </div>
        <IconButton
          icon={
            saved ? (
              <BookmarkCheck size={14} />
            ) : (
              <Bookmark size={14} />
            )
          }
          variant={saved ? "active" : "ghost"}
          size="sm"
          aria-label={
            saved ? "Remove from shortlist" : "Save to shortlist"
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(profile.slug);
          }}
        />
      </div>

      {/* Role chips — active first, up to 2 quiet ones, +N indicator */}
      {profile.roles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {primaryRole && (
            <Chip variant="active" size="sm">
              {primaryRole}
            </Chip>
          )}
          {otherRoles.map((r) => (
            <Chip key={r} variant="default" size="sm">
              {r}
            </Chip>
          ))}
          {profile.roles.length > 3 && (
            <Chip variant="muted" size="sm">
              +{profile.roles.length - 3}
            </Chip>
          )}
        </div>
      )}

      {/* Footer: city + view-profile arrow */}
      <div className="mt-auto flex items-center justify-between pt-4">
        {profile.city ? (
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <MapPin size={11} />
            {profile.city}
          </span>
        ) : (
          <span /> // keeps the arrow right-aligned even without a city
        )}
        <Link
          href={`/crew/${profile.slug}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          View profile
          <ArrowRight
            size={11}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </motion.div>
  );
}

// --- avatar ---------------------------------------------------------

function Avatar({
  name,
  photoUrl,
  available,
}: {
  name: string;
  photoUrl: string | null;
  available: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-950 ring-1 ring-neutral-800">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Initials name={name} />
        )}
      </div>
      {available && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-neutral-900"
          title="Available this month"
        />
      )}
    </div>
  );
}

function Initials({ name }: { name: string }) {
  const init = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent to-accent-soft text-sm font-semibold text-neutral-950">
      {init || "·"}
    </div>
  );
}

// --- helpers --------------------------------------------------------

function isAvailableThisMonth(availableDates: string[]): boolean {
  if (availableDates.length === 0) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${y}-${m}`;
  return availableDates.some((d) => d.startsWith(prefix));
}
