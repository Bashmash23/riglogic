"use client";

// Tiny nav-bar link that shows a bookmark icon + live count badge
// whenever the visitor has at least one crew profile saved. Hidden
// when the shortlist is empty so the nav doesn't show a 0-count
// chip to users who haven't used the feature yet.

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useShortlist } from "@/lib/crewShortlist";

export function ShortlistNavLink() {
  const { slugs, mounted } = useShortlist();
  if (!mounted || slugs.length === 0) return null;
  return (
    <Link
      href="/crew/shortlist"
      title="My shortlist"
      aria-label={`My shortlist (${slugs.length})`}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
    >
      <Bookmark size={14} />
      <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-neutral-950">
        {slugs.length}
      </span>
    </Link>
  );
}
