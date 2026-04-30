"use client";

// Date-range picker rebuilt to match the new design system mockup:
//
//   Empty state    pill: 📅 Shoot dates · OPTIONAL chip on the right
//   Filled state   pill: 📅 May 12 → May 14 · 3d chip · X to clear
//   Active state   pill highlighted in persimmon · popover below with
//                  a month grid for range selection
//
// Range selection logic: first click sets the start, second click
// sets the end. Clicking before the start resets to a new start.
// All dates are stored as YYYY-MM-DD strings to dodge timezone
// edge cases (matches the existing AvailabilityCalendar pattern).

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useKit } from "@/lib/kitStore";
import { computeRentalDays } from "@/lib/kitSnapshot";
import { Chip } from "@/components/ui/Chip";

// --- date helpers (pure strings, no Date math where possible) -------

function todayISO(): string {
  const d = new Date();
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}

function iso(y: number, m: number, d: number): string {
  return `${y.toString().padStart(4, "0")}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

/** Day-of-week of the 1st: 0 = Sunday … 6 = Saturday. */
function firstWeekday(y: number, m: number): number {
  return new Date(y, m, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function shortDate(s: string): string {
  // YYYY-MM-DD → "May 12"
  const [, m, d] = s.split("-").map((x) => parseInt(x, 10));
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}

// --- component -------------------------------------------------------

export function DateRange() {
  const { kit, setDates } = useKit();
  const [open, setOpen] = useState(false);
  // In-progress range selection. Persists only while popover is
  // open — committing applies it to the kit store.
  const [pendingStart, setPendingStart] = useState<string | null>(
    kit.startDate ?? null,
  );
  const [pendingEnd, setPendingEnd] = useState<string | null>(
    kit.endDate ?? null,
  );

  // Re-sync local state if kit changes externally (e.g. localStorage
  // restore on another tab).
  useEffect(() => {
    setPendingStart(kit.startDate ?? null);
    setPendingEnd(kit.endDate ?? null);
  }, [kit.startDate, kit.endDate]);

  const days = computeRentalDays(kit.startDate, kit.endDate);
  const hasDates = Boolean(kit.startDate && kit.endDate);

  // Click-outside dismiss. Apply on close so a partial selection
  // (start only) doesn't get committed and the user doesn't lose
  // their progress; we just close the popover.
  const popRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleDayClick = (day: string) => {
    // First click → start. Second click before start → reset to
    // new start. Second click on/after start → end + commit.
    if (!pendingStart || (pendingStart && pendingEnd)) {
      setPendingStart(day);
      setPendingEnd(null);
      return;
    }
    if (day < pendingStart) {
      setPendingStart(day);
      setPendingEnd(null);
      return;
    }
    setPendingEnd(day);
    setDates(pendingStart, day);
    setOpen(false);
  };

  const clear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPendingStart(null);
    setPendingEnd(null);
    setDates(null, null);
  };

  // ----- trigger state classes -----
  const triggerBase =
    "group flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors";
  const triggerActive = open
    ? "border-[var(--accent-border-30)] bg-[var(--accent-tint-5)]"
    : hasDates
      ? "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700";

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${triggerBase} ${triggerActive}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <CalendarIcon
            size={14}
            className={
              open || hasDates ? "shrink-0 text-accent" : "shrink-0 text-neutral-500"
            }
          />
          {hasDates && kit.startDate && kit.endDate ? (
            <span className="flex min-w-0 items-center gap-2 truncate">
              <span className="truncate text-neutral-100">
                {shortDate(kit.startDate)}
              </span>
              <span className="text-neutral-600">→</span>
              <span className="truncate text-neutral-100">
                {shortDate(kit.endDate)}
              </span>
              {days > 0 && (
                <Chip variant="active" size="sm">
                  {days}d
                </Chip>
              )}
            </span>
          ) : (
            <span className="text-neutral-400">Shoot dates</span>
          )}
        </span>
        {hasDates ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear dates"
            onClick={clear}
            className="ml-1 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <X size={12} />
          </span>
        ) : (
          <Chip variant="muted" size="sm">
            Optional
          </Chip>
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="Pick shoot dates"
          className="absolute left-0 top-full z-40 mt-2 w-[300px] rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl"
        >
          <RangeCalendar
            start={pendingStart}
            end={pendingEnd}
            onPick={handleDayClick}
          />
          <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3">
            <button
              type="button"
              onClick={() => clear()}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              Clear
            </button>
            <p className="text-[10px] leading-tight text-neutral-500">
              Click start, then end.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- inline range calendar (single month) ---------------------------

function RangeCalendar({
  start,
  end,
  onPick,
}: {
  start: string | null;
  end: string | null;
  onPick: (iso: string) => void;
}) {
  const now = new Date();
  // Cursor month — initialise to the start date's month if set,
  // otherwise current month.
  const [year, setYear] = useState(() =>
    start ? parseInt(start.slice(0, 4), 10) : now.getFullYear(),
  );
  const [month, setMonth] = useState(() =>
    start ? parseInt(start.slice(5, 7), 10) - 1 : now.getMonth(),
  );

  const today = todayISO();

  const cells: Array<{ day: number; iso: string } | null> = useMemo(() => {
    const arr: Array<{ day: number; iso: string } | null> = [];
    // Mockup uses Mon-first; offset = (firstWeekday + 6) % 7
    const offset = (firstWeekday(year, month) + 6) % 7;
    for (let i = 0; i < offset; i++) arr.push(null);
    const dim = daysInMonth(year, month);
    for (let d = 1; d <= dim; d++) {
      arr.push({ day: d, iso: iso(year, month, d) });
    }
    return arr;
  }, [year, month]);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const inRange = (day: string) => {
    if (!start || !end) return false;
    return day > start && day < end;
  };
  const isStart = (day: string) => start === day;
  const isEnd = (day: string) => end === day;
  const isPast = (day: string) => day < today;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="text-xs font-semibold text-neutral-100">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          type="button"
          onClick={next}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-medium uppercase tracking-wider text-neutral-500">
        {WEEKDAY_LABELS.slice(1).concat(WEEKDAY_LABELS[0]).map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (cell === null) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const past = isPast(cell.iso);
          const startSel = isStart(cell.iso);
          const endSel = isEnd(cell.iso);
          const between = inRange(cell.iso);
          const isToday = cell.iso === today;
          let className =
            "aspect-square flex items-center justify-center rounded text-[11px] transition-colors";
          if (past) {
            className += " text-neutral-700 cursor-not-allowed";
          } else if (startSel || endSel) {
            className +=
              " bg-accent font-semibold text-neutral-950 hover:bg-accent-soft";
          } else if (between) {
            className +=
              " bg-[var(--accent-tint-10)] text-accent hover:bg-[var(--accent-tint-5)]";
          } else {
            className += " text-neutral-300 hover:bg-neutral-800";
            if (isToday) className += " ring-1 ring-accent/40";
          }
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={past}
              onClick={() => onPick(cell.iso)}
              className={className}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
