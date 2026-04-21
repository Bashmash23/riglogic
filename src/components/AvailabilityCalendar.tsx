"use client";

// Month-grid availability calendar.
//
// Two modes:
//   editable:  click a day to toggle in/out of the available set;
//              call onChange with the next set on every flip.
//   read-only: just renders highlighted days, no interaction.
//
// Stores days as ISO YYYY-MM-DD strings so timezone never shifts a
// date by a day. Past months are reachable but their days are not
// editable in the editor (you can't say you were available
// yesterday — that's pointless).

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  value: string[]; // YYYY-MM-DD set
  onChange?: (next: string[]) => void;
  /** When true, no clicks fire; days only render their state. */
  readOnly?: boolean;
}

// --- pure date utilities --------------------------------------------

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

/** Day-of-week of the 1st (0=Sun, 1=Mon … 6=Sat). */
function firstWeekday(y: number, m: number): number {
  return new Date(y, m, 1).getDay();
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- component -------------------------------------------------------

export function AvailabilityCalendar({
  value,
  onChange,
  readOnly = false,
}: Props) {
  // Cursor month — start on today.
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const today = todayISO();
  const valueSet = useMemo(() => new Set(value), [value]);

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // Build the cell grid: leading empties + day numbers.
  const cells: Array<{ day: number; iso: string } | null> = [];
  const lead = firstWeekday(year, month);
  for (let i = 0; i < lead; i++) cells.push(null);
  const dim = daysInMonth(year, month);
  for (let d = 1; d <= dim; d++) {
    cells.push({ day: d, iso: iso(year, month, d) });
  }

  const toggle = (day: string) => {
    if (readOnly || !onChange) return;
    if (day < today) return; // can't toggle past days
    const next = new Set(valueSet);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    onChange(Array.from(next).sort());
  };

  const markedThisMonth = cells.filter(
    (c): c is { day: number; iso: string } =>
      c !== null && valueSet.has(c.iso),
  ).length;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-medium text-neutral-100">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-neutral-500">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} className="aspect-square" />
          ) : (
            <DayCell
              key={cell.iso}
              day={cell.day}
              iso={cell.iso}
              isToday={cell.iso === today}
              isPast={cell.iso < today}
              isAvailable={valueSet.has(cell.iso)}
              readOnly={readOnly}
              onClick={() => toggle(cell.iso)}
            />
          ),
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-500">
        {readOnly ? (
          <span>
            {markedThisMonth > 0
              ? `${markedThisMonth} day${markedThisMonth === 1 ? "" : "s"} available this month`
              : "No availability marked for this month"}
          </span>
        ) : (
          <span>
            Click days to toggle. Past days are locked.
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
          Available
        </span>
      </div>
    </div>
  );
}

function DayCell({
  day,
  isToday,
  isPast,
  isAvailable,
  readOnly,
  onClick,
}: {
  day: number;
  iso: string;
  isToday: boolean;
  isPast: boolean;
  isAvailable: boolean;
  readOnly: boolean;
  onClick: () => void;
}) {
  const base =
    "aspect-square flex items-center justify-center rounded-md text-xs transition-colors";
  if (isAvailable) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={readOnly || isPast}
        className={`${base} bg-accent font-semibold text-neutral-950 ${
          readOnly || isPast ? "cursor-default" : "hover:bg-accent-soft"
        }`}
      >
        {day}
      </button>
    );
  }
  if (isPast) {
    return (
      <div
        className={`${base} text-neutral-700 ${
          isToday ? "ring-1 ring-neutral-700" : ""
        }`}
      >
        {day}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={readOnly}
      className={`${base} text-neutral-300 ${
        readOnly
          ? "cursor-default"
          : "hover:bg-neutral-800"
      } ${isToday ? "ring-1 ring-accent/40" : ""}`}
    >
      {day}
    </button>
  );
}
