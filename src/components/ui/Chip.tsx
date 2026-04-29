"use client";

// Pill-style chip. Three states matching the mockup:
//
//   default   neutral border + neutral text. Inactive.
//   active    persimmon-tinted surface + persimmon border + accent
//             text. The "selected" state.
//   removable like default but with a trailing X button.
//
// Used for role chips on crew profiles, category filters, tags,
// the BETA pill in the hero eyebrow, etc. Stays purely presentational —
// no built-in click handler so callers can wire whatever they want.

import { forwardRef, type HTMLAttributes } from "react";
import { X } from "lucide-react";

export type ChipVariant = "default" | "active" | "muted";
export type ChipSize = "sm" | "md";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  leadingIcon?: React.ReactNode;
  /** When provided, renders a trailing X that fires this. */
  onRemove?: () => void;
}

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  default:
    "border border-neutral-800 bg-neutral-900 text-neutral-300",
  active:
    "border border-[var(--accent-border-30)] bg-[var(--accent-tint-10)] text-accent",
  muted: "border border-neutral-900 bg-neutral-900/40 text-neutral-500",
};

const SIZE_CLASSES: Record<ChipSize, string> = {
  sm: "h-5 px-2 text-[10px] gap-1",
  md: "h-7 px-2.5 text-xs gap-1.5",
};

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    variant = "default",
    size = "md",
    leadingIcon,
    onRemove,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        "inline-flex items-center rounded-full font-medium uppercase tracking-wide whitespace-nowrap",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {leadingIcon}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-neutral-800/60"
          aria-label="Remove"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
});
