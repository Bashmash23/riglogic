"use client";

import { Copy, Minus, Plus, Trash2, Sparkles } from "lucide-react";
import { useKit } from "@/lib/kitStore";
import { getGear, getHouse } from "@/lib/catalog";
import type { KitLine } from "@/lib/types";

interface Props {
  onStartWithCamera?: () => void;
}

export function KitSidebar({ onStartWithCamera }: Props) {
  const { kit, setProjectName, removeLine, duplicateLine, setQuantity } =
    useKit();

  const linesWithGear = kit.lines
    .map((line) => ({ line, gear: getGear(line.gearItemId) }))
    .filter((x): x is { line: KitLine; gear: NonNullable<ReturnType<typeof getGear>> } =>
      Boolean(x.gear),
    );

  const perDayTotal = linesWithGear.reduce(
    (sum, { line, gear }) => sum + line.quantity * gear.dayRateAED,
    0,
  );

  const isEmpty = linesWithGear.length === 0;

  return (
    <aside className="flex w-full flex-col border-l border-neutral-800 bg-neutral-950 lg:w-[380px] lg:min-w-[380px]">
      <div className="border-b border-neutral-800 p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Project
        </label>
        <input
          type="text"
          value={kit.projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled shoot"
          className="mt-1 w-full bg-transparent text-lg font-semibold text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
          <span>
            {linesWithGear.length}{" "}
            {linesWithGear.length === 1 ? "line" : "lines"}
          </span>
          <span>
            {linesWithGear.reduce((n, { line }) => n + line.quantity, 0)} pcs
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onStartWithCamera={onStartWithCamera} />
        ) : (
          <ul className="divide-y divide-neutral-900">
            {linesWithGear.map(({ line, gear }) => {
              const house = getHouse(gear.rentalHouseId);
              return (
                <li key={line.lineId} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-neutral-100 truncate">
                        {gear.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {house?.name ?? "—"} · AED{" "}
                        {gear.dayRateAED.toLocaleString()}/day
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.lineId)}
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
                      aria-label={`Remove ${gear.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-md border border-neutral-800">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(line.lineId, line.quantity - 1)
                        }
                        disabled={line.quantity <= 1}
                        className="p-1.5 text-neutral-400 hover:text-neutral-100 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[2rem] px-1 text-center text-sm font-medium text-neutral-100">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(line.lineId, line.quantity + 1)
                        }
                        className="p-1.5 text-neutral-400 hover:text-neutral-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => duplicateLine(line.lineId)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                    >
                      <Copy size={12} />
                      Duplicate
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-neutral-800 p-4 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-neutral-400">Per-day total</span>
          <span className="text-lg font-semibold text-neutral-100">
            AED {perDayTotal.toLocaleString()}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-neutral-500">
          Indicative rates only. Confirm pricing with rental house.
        </p>
        <button
          type="button"
          disabled={isEmpty}
          className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors"
          title={isEmpty ? "Add items before exporting" : "Export (M3)"}
        >
          Export &amp; share
        </button>
      </div>
    </aside>
  );
}

function EmptyState({
  onStartWithCamera,
}: {
  onStartWithCamera?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Sparkles size={18} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-neutral-100">
          Your kit is empty
        </h3>
        <p className="mt-1 max-w-[14rem] text-xs text-neutral-500">
          Most shoots start with the camera. Smart-Match fills in the
          essentials from there.
        </p>
      </div>
      {onStartWithCamera && (
        <button
          type="button"
          onClick={onStartWithCamera}
          className="mt-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:border-neutral-700"
        >
          Start with a camera
        </button>
      )}
    </div>
  );
}
