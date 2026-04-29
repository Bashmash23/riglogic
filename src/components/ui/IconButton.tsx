"use client";

// Square icon-only button. The mockup shows a row of these for
// search / settings / more / trash — all the same shape, varying
// only by which lucide icon they wrap.
//
// Always pass an aria-label — these have no visible text.

import { forwardRef, type ButtonHTMLAttributes } from "react";

export type IconButtonVariant = "default" | "ghost" | "active";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Required for accessibility — these have no visible text. */
  "aria-label": string;
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  default:
    "border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100",
  ghost:
    "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100",
  active:
    "border border-[var(--accent-border-30)] bg-[var(--accent-tint-10)] text-accent",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 rounded-md",
  md: "h-10 w-10 rounded-md",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      variant = "default",
      size = "md",
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        className={[
          BASE_CLASSES,
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);
