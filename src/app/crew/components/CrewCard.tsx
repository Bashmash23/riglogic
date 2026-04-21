// Single freelancer card in the /crew directory grid. Behance-style:
// large photo on top, name + headline below, role chips at the
// bottom. Whole card links to the public profile.

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CrewProfilePublic } from "@/lib/crewTypes";

export function CrewCard({ profile }: { profile: CrewProfilePublic }) {
  const primaryRole = profile.roles[0] ?? null;
  return (
    <Link
      href={`/crew/${profile.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60 transition-colors hover:border-neutral-700"
    >
      {/* Photo — flatter 16:9 cinematic strip. Was aspect-[4/3]
          which felt too tall on single-column mobile and at lg
          width. Combined with the denser grid below this gives a
          tighter Behance-style row. */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt={profile.displayName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <InitialsAvatar name={profile.displayName} />
        )}
        {profile.tier === "pro" && (
          <span className="absolute top-3 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-950">
            Pro
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-base font-medium text-neutral-100">
            {profile.displayName}
          </h3>
          {profile.headline && (
            <p className="mt-0.5 truncate text-sm text-neutral-400">
              {profile.headline}
            </p>
          )}
          {(profile.city || primaryRole) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
              {profile.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} />
                  {profile.city}
                </span>
              )}
              {profile.city && primaryRole && (
                <span className="text-neutral-700">·</span>
              )}
              {primaryRole && <span>{primaryRole}</span>}
            </div>
          )}
        </div>
        {profile.roles.length > 1 && (
          <div className="mt-auto flex flex-wrap gap-1">
            {profile.roles.slice(1, 4).map((role) => (
              <span
                key={role}
                className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400"
              >
                {role}
              </span>
            ))}
            {profile.roles.length > 4 && (
              <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-500">
                +{profile.roles.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Initials on accent gradient when no photo uploaded yet. */
function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-2xl font-semibold text-accent ring-2 ring-accent/20">
        {initials || "·"}
      </span>
    </div>
  );
}
