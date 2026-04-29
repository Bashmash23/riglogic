"use client";

// Segmented control — group of related options where exactly one
// is active at a time. The mockup shows it as Builder · Crew ·
// Rentals with a persimmon-tinted active pill.
//
// Keyboard accessible (left/right arrows move focus; space/enter
// activates) without hauling in a third-party library. Callers
// pass an array of options + the current value + an onChange.
// Generic over the value type so it can hold strings, enums, or
// any other primitive.

"use client";

import { useRef, type KeyboardEvent } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Optional icon placed before the label. */
  icon?: React.ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Optional label for screen readers (announced as the group name). */
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = "md",
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowLeft" ? -1 : 1;
    const next = (idx + dir + options.length) % options.length;
    refs.current[next]?.focus();
    onChange(options[next].value);
  };

  const sizeClass = size === "sm" ? "h-8 text-xs" : "h-9 text-sm";
  const buttonPad = size === "sm" ? "px-3" : "px-4";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-900/60 p-1",
        sizeClass,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((opt, idx) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKey(e, idx)}
            className={[
              "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors h-full",
              buttonPad,
              active
                ? "bg-[var(--accent-tint-10)] text-accent"
                : "text-neutral-400 hover:text-neutral-100",
            ].join(" ")}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
