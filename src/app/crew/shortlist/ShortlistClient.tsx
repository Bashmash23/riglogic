"use client";

// Renders the current shortlist: looks up the full profile data
// for every saved slug via the public /api/crew endpoint, filters
// to just those, and shows them as CrewCards (with the usual
// shortlist heart toggled on). Also exposes a "Print / save as PDF"
// action that uses the browser's built-in print dialog — no server
// work, no PDF dependency.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Printer, Trash2, ArrowRight, BookmarkX } from "lucide-react";
import { toast } from "sonner";
import { useShortlist } from "@/lib/crewShortlist";
import { confirm } from "@/components/ConfirmDialog";
import type { CrewProfilePublic } from "@/lib/crewTypes";
import { CrewCard } from "../components/CrewCard";

export function ShortlistClient() {
  const { slugs, clear, mounted } = useShortlist();
  const [allProfiles, setAllProfiles] = useState<CrewProfilePublic[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Fetch every profile once. Client-side filter below is cheap.
  // We could fetch only the slugs we need, but the API isn't set
  // up for bulk-by-slug lookup yet and /api/crew is small enough
  // that the savings aren't meaningful at this scale.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/crew");
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { profiles: CrewProfilePublic[] };
        if (!cancelled) setAllProfiles(data.profiles);
      } catch {
        if (!cancelled) setAllProfiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Preserve insert order (newest saves at the end).
  const profiles = useMemo(() => {
    if (!allProfiles) return [];
    const bySlug = new Map(allProfiles.map((p) => [p.slug, p]));
    return slugs
      .map((s) => bySlug.get(s))
      .filter((p): p is CrewProfilePublic => Boolean(p));
  }, [allProfiles, slugs]);

  // Any slugs that no longer match a published profile — the
  // freelancer may have deleted / hidden their profile since the
  // user saved them. We surface this so the user can clean up.
  const stale = mounted && allProfiles
    ? slugs.filter((s) => !allProfiles.find((p) => p.slug === s))
    : [];

  const print = () => window.print();

  if (!mounted || loading) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-800 px-6 py-20 text-center text-sm text-neutral-500">
        Loading your shortlist…
      </div>
    );
  }

  if (slugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 px-6 py-20 text-center">
        <BookmarkX size={24} className="text-neutral-600" />
        <h2 className="mt-4 text-base font-medium text-neutral-200">
          Your shortlist is empty
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Browse the directory and tap the bookmark on a crew card or
          profile to add someone here.
        </p>
        <Link
          href="/crew"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft"
        >
          Browse crew
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="text-xs text-neutral-500">
          {profiles.length}{" "}
          {profiles.length === 1 ? "person" : "people"} saved
          {stale.length > 0 && (
            <span className="ml-2 text-amber-400">
              · {stale.length}{" "}
              {stale.length === 1 ? "entry" : "entries"} no longer
              available
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={print}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700"
          >
            <Printer size={12} />
            Print / save as PDF
          </button>
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: "Clear your shortlist?",
                description: `All ${profiles.length} saved ${profiles.length === 1 ? "profile" : "profiles"} will be removed from this device. This can't be undone.`,
                confirmText: "Clear",
                cancelText: "Keep",
                variant: "danger",
              });
              if (ok) {
                clear();
                toast.success("Shortlist cleared");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400 hover:border-red-900 hover:text-red-300"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </div>

      {profiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-2">
          {profiles.map((p) => (
            <CrewCard key={p.id} profile={p} />
          ))}
        </div>
      )}

      {stale.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200 print:hidden">
          <p className="font-medium">
            {stale.length} saved{" "}
            {stale.length === 1 ? "profile is" : "profiles are"} no longer
            available
          </p>
          <p className="mt-1 text-amber-200/80">
            The freelancer may have deleted or hidden their profile. Use
            Clear to reset the shortlist.
          </p>
        </div>
      )}
    </>
  );
}
