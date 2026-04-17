"use client";

import { useEffect, useState } from "react";
import { Calendar, X } from "lucide-react";
import { useKit } from "@/lib/kitStore";
import { computeRentalDays } from "@/lib/kitSnapshot";

export function DateRange() {
  const { kit, setDates } = useKit();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(kit.startDate ?? "");
  const [end, setEnd] = useState(kit.endDate ?? "");

  // Keep local state in sync when kit changes externally (e.g. restored from
  // localStorage).
  useEffect(() => {
    setStart(kit.startDate ?? "");
    setEnd(kit.endDate ?? "");
  }, [kit.startDate, kit.endDate]);

  const days = computeRentalDays(kit.startDate, kit.endDate);
  const hasDates = Boolean(kit.startDate && kit.endDate);

  const apply = () => {
    // Validate: both set or both blank; end not before start.
    if (!start || !end) {
      setDates(null, null);
    } else if (new Date(end) < new Date(start)) {
      // swap silently
      setDates(end, start);
    } else {
      setDates(start, end);
    }
    setOpen(false);
  };

  const clear = () => {
    setStart("");
    setEnd("");
    setDates(null, null);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-xs hover:border-neutral-700"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar size={14} className="shrink-0 text-accent" />
          {hasDates ? (
            <span className="truncate text-neutral-100">
              {kit.startDate} → {kit.endDate}
              <span className="ml-1.5 text-neutral-500">({days}d)</span>
            </span>
          ) : (
            <span className="text-neutral-400">Set shoot dates (optional)</span>
          )}
        </div>
        {hasDates && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="ml-1 rounded p-0.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
            role="button"
            tabIndex={0}
            aria-label="Clear dates"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-40 mt-2 w-[290px] rounded-lg border border-neutral-800 bg-neutral-950 p-3 shadow-xl"
          role="dialog"
        >
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                Start
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                End
              </label>
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                clear();
                setOpen(false);
              }}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              Skip / clear
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded bg-accent px-3 py-1 text-xs font-medium text-neutral-950 hover:bg-accent-soft"
            >
              Apply
            </button>
          </div>
          <p className="mt-2 text-[10px] text-neutral-500">
            Dates are optional. With dates set, the kit total multiplies the
            per-day by the number of days.
          </p>
        </div>
      )}
    </div>
  );
}
