"use client";

// Single Button primitive that owns the four button shapes from
// the design system mockup:
//
//   primary    Filled persimmon, dark text. Headline CTA.
//   secondary  Outlined neutral, light text. Calmer alternative.
//   ghost      No fill / no border. Tonal hover only. Inline links
//              that need to read as actions.
//   tonal      Persimmon /5 surface + persimmon /30 border + accent
//              text. The "Smart-Match / Add all" treatment — quiet
//              but clearly accent-related.
//
// Sizes: sm (compact toolbar) · md (default) · lg (hero CTA).
// The component forwards refs (so it can be wrapped in Tooltip,
// SignInButton, etc.) and accepts an optional asChild to render
// as a Next/Link or any other element via React.cloneElement.
// Keep external API surface tight — variant + size cover almost
// every call site.

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "tonal";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Left-side icon. */
  leadingIcon?: React.ReactNode;
  /** Right-side icon. Common for arrows / external-link glyphs. */
  trailingIcon?: React.ReactNode;
  /** Show a spinner + disable. Keeps the layout from jumping. */
  loading?: boolean;
  /**
   * Render the children element (e.g. <Link>) with all the button
   * styles + props merged onto it. Like Radix Slot — single child
   * required when true. Used so Next.js <Link> can act as a button
   * without nesting an <a> inside a <button>.
   */
  asChild?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-neutral-950 hover:bg-accent-soft active:scale-[0.98]",
  secondary:
    "border border-neutral-800 bg-neutral-900/60 text-neutral-100 hover:border-neutral-700 hover:bg-neutral-900",
  ghost: "text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100",
  tonal:
    "border border-[var(--accent-border-30)] bg-[var(--accent-tint-5)] text-accent hover:bg-[var(--accent-tint-10)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-base gap-2 rounded-md",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center font-medium select-none transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  extra?: string,
) {
  return [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      loading,
      asChild,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const merged = classes(variant, size, className);
    const content = (
      <>
        {loading ? (
          <Loader2
            size={size === "lg" ? 16 : 14}
            className="animate-spin"
            aria-hidden
          />
        ) : (
          leadingIcon
        )}
        {children}
        {!loading && trailingIcon}
      </>
    );

    // asChild lets the consumer wrap a <Link> (or anything else)
    // and inherit the button styling without nesting <a> in
    // <button> (which is invalid HTML). Mirrors the Radix Slot API
    // without pulling in another dependency for one thing.
    if (asChild) {
      const child = Children.only(children);
      if (!isValidElement(child)) return null;
      const childEl = child as ReactElement<{ className?: string }>;
      return cloneElement(childEl, {
        className: [merged, childEl.props.className ?? ""]
          .filter(Boolean)
          .join(" "),
        // We can't add ref to an arbitrary child without knowing
        // its type — leave ref unforwarded for asChild use. Most
        // call sites that need a ref aren't asChild.
      });
    }

    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        disabled={disabled || loading}
        className={merged}
        {...rest}
      >
        {content}
      </button>
    );
  },
);
