"use client";

// Heart/save button toggled on/off based on whether a given
// profile slug is in the viewer's localStorage shortlist. Used in
// two variants:
//   pill   — full bordered pill on the profile page hero (bigger,
//            reads as a CTA)
//   icon   — tiny round overlay on a CrewCard in the grid
// Both share the same toggle handler. Rendering is deferred until
// the hook mounts so SSR output doesn't flash "saved" or "not
// saved" incorrectly before hydration.

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useShortlist } from "@/lib/crewShortlist";

interface Props {
  slug: string;
  variant?: "pill" | "icon";
  label?: string;
}

export function ShortlistButton({ slug, variant = "icon", label }: Props) {
  const { has, toggle, mounted } = useShortlist();
  const saved = mounted && has(slug);

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(slug);
        }}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
          saved
            ? "border-accent bg-accent/10 text-accent hover:bg-accent/20"
            : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
        }`}
      >
        {saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
        {saved ? "Saved" : label ?? "Save to shortlist"}
      </button>
    );
  }

  // icon variant — intended for use as an absolutely-positioned
  // corner overlay on a CrewCard.
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
        saved
          ? "bg-accent text-neutral-950 hover:bg-accent-soft"
          : "bg-neutral-950/70 text-neutral-300 hover:bg-neutral-950 hover:text-neutral-100"
      }`}
    >
      {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
    </button>
  );
}
