"use client";

import { useState } from "react";

// Shared image component for gear cards + kit-sidebar thumbnails.
// Behaviour:
//   1. Render the provided src normally.
//   2. On error, retry once with a cache-busting query param — handles
//      transient CDN blips (Wikimedia, Shopify, etc.) without showing
//      the placeholder for a flaky network.
//   3. If the retry also fails, fall back to a branded RigLogic
//      placeholder instead of the browser's broken-image icon or an
//      empty thumbnail, so the grid reads as intentional and on-brand
//      even when a source image is gone for good.

interface Props {
  src: string | null | undefined;
  alt: string;
  /**
   * "card" = full GearCard image area (uses wordmark placeholder).
   * "thumb" = 40px sidebar thumbnail (uses tiny R monogram).
   */
  variant?: "card" | "thumb";
  /** Inner padding around the loaded image. */
  padding?: "sm" | "md";
}

export function GearImage({
  src,
  alt,
  variant = "card",
  padding = "md",
}: Props) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const hasSrc = !!src;
  const showImage = hasSrc && !failed;

  // Append a cache-buster on retry so the browser doesn't just re-serve
  // the same failed response from cache.
  const effectiveSrc =
    hasSrc && attempt > 0
      ? `${src}${src!.includes("?") ? "&" : "?"}_r=${attempt}`
      : src ?? undefined;

  const padClass = padding === "sm" ? "p-1" : "p-2";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
        showImage
          ? "bg-neutral-950"
          : "bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800"
      }`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={attempt}
          src={effectiveSrc}
          alt={alt}
          loading="lazy"
          onError={() => {
            if (attempt < 1) {
              setAttempt((a) => a + 1);
            } else {
              setFailed(true);
            }
          }}
          className={`h-full w-full object-contain ${padClass}`}
        />
      ) : variant === "thumb" ? (
        <ThumbMark />
      ) : (
        <CardMark />
      )}
    </div>
  );
}

// Full-size mark for gear cards. Modern minimal wordmark on a soft
// vignette — reads as "this is a RigLogic thing" without looking like
// a broken thumbnail.
function CardMark() {
  return (
    <div className="pointer-events-none flex select-none flex-col items-center gap-1.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-accent/30 to-accent/5 ring-1 ring-accent/20">
        <span className="text-base font-bold leading-none text-accent">R</span>
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Rig<span className="text-accent/80">Logic</span>
      </span>
    </div>
  );
}

// Tight monogram for sidebar thumbnails (40×40).
function ThumbMark() {
  return (
    <span className="pointer-events-none flex h-6 w-6 select-none items-center justify-center rounded-sm bg-gradient-to-br from-accent/30 to-accent/5 ring-1 ring-accent/20">
      <span className="text-[11px] font-bold leading-none text-accent">R</span>
    </span>
  );
}
