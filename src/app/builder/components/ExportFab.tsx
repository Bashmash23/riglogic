"use client";

import { Share2 } from "lucide-react";
import { useKit } from "@/lib/kitStore";

interface Props {
  onClick: () => void;
}

/**
 * Floating "Export & share" button pinned to the bottom-right of the viewport.
 * Always visible once the kit has at least one line, regardless of scroll.
 */
export function ExportFab({ onClick }: Props) {
  const { kit } = useKit();
  const lineCount = kit.lines.length;
  if (lineCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/50 ring-1 ring-black/10 hover:bg-accent-soft transition-colors"
      aria-label="Export and share kit"
    >
      <Share2 size={16} />
      <span>Export &amp; share</span>
      <span className="rounded-full bg-neutral-950/15 px-1.5 py-0.5 text-[11px] font-semibold">
        {lineCount}
      </span>
    </button>
  );
}
