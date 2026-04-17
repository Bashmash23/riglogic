"use client";

import { useState } from "react";
import { Copy, Minus, Plus, Trash2, Sparkles } from "lucide-react";
import { useKit } from "@/lib/kitStore";
import { getGear, getHouse } from "@/lib/catalog";
import { computeRentalDays } from "@/lib/kitSnapshot";
import type { KitLine } from "@/lib/types";
import { DateRange } from "./DateRange";
import { ProjectSwitcher } from "./ProjectSwitcher";

interface Props {
  onStartWithCamera?: () => void;
}

export function KitSidebar({ onStartWithCamera }: Props) {
  const { kit, removeLine, duplicateLine, setQuantity } = useKit();

  const linesWithGear = kit.lines
    .map((line) => ({ line, gear: getGear(line.gearItemId) }))
    .filter(
      (x): x is { line: KitLine; gear: NonNullable<ReturnType<typeof getGear>> } =>
        Boolean(x.gear),
    );

  const perDayTotal = linesWithGear.reduce(
    (sum, { line, gear }) => sum + line.quantity * gear.dayRateAED,
    0,
  );
  const days = computeRentalDays(kit.startDate, kit.endDate);
  const kitTotal = days > 0 ? perDayTotal * days : 0;

  const isEmpty = linesWithGear.length === 0;

  return (
    // The sidebar naturally fills the height of the flex row on desktop
    // (BuilderShell locks the outer column to 100vh and scrolls <main>
    // internally), so it always stays on screen while you browse gear.
    // min-h-0 on the aside is what lets the line-list div below actually
    // scroll instead of stretching the aside beyond its parent.
    <aside className="flex w-full flex-col border-l border-neutral-800 bg-neutral-950 lg:min-h-0 lg:w-[380px] lg:min-w-[380px]">
      <div className="border-b border-neutral-800 p-4 space-y-3">
        <ProjectSwitcher />
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            {linesWithGear.length}{" "}
            {linesWithGear.length === 1 ? "line" : "lines"}
          </span>
          <span>
            {linesWithGear.reduce((n, { line }) => n + line.quantity, 0)} pcs
          </span>
        </div>
        <DateRange />
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
                  <div className="flex items-start gap-2">
                    <Thumbnail
                      src={gear.imageUrl ?? null}
                      alt={gear.name}
                      category={gear.category}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-neutral-100">
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

      {/* Totals — always visible at the bottom of the sidebar. Updates
          live as items are added / removed / quantity-changed because
          useKit() re-renders the whole sidebar on any kit mutation. */}
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {days > 0 ? "Kit total" : "Per-day total"}
            {days > 0 && (
              <span className="ml-1 text-neutral-500 normal-case">
                · {days}d
              </span>
            )}
          </span>
          <span className="text-2xl font-semibold text-accent">
            AED {(days > 0 ? kitTotal : perDayTotal).toLocaleString()}
          </span>
        </div>
        {days > 0 && (
          <div className="mt-1 flex items-baseline justify-between text-xs">
            <span className="text-neutral-500">Per-day</span>
            <span className="text-neutral-300">
              AED {perDayTotal.toLocaleString()}
            </span>
          </div>
        )}
        <p className="mt-2 text-[11px] leading-snug text-neutral-500">
          Indicative rates only. Confirm pricing with rental house.
        </p>
      </div>
    </aside>
  );
}

const THUMB_GRADIENTS: Record<string, string> = {
  Cameras: "from-amber-900/60 to-orange-800/50",
  Lenses: "from-sky-900/60 to-blue-800/50",
  Lighting: "from-yellow-900/60 to-amber-700/50",
  Grip: "from-neutral-800/80 to-neutral-700/60",
  Audio: "from-purple-900/60 to-fuchsia-800/50",
  Monitoring: "from-emerald-900/60 to-teal-800/50",
  Power: "from-red-900/60 to-rose-800/50",
  Media: "from-indigo-900/60 to-violet-800/50",
  Accessories: "from-stone-800/80 to-zinc-700/60",
};

function Thumbnail({
  src,
  alt,
  category,
}: {
  src: string | null;
  alt: string;
  category: string;
}) {
  const [failed, setFailed] = useState(false);
  const gradient =
    THUMB_GRADIENTS[category] ?? "from-neutral-800 to-neutral-700";
  const showImage = !!src && !failed;
  return (
    <div
      className={`relative h-10 w-10 shrink-0 overflow-hidden rounded border border-neutral-800 ${
        showImage ? "bg-neutral-950" : `bg-gradient-to-br ${gradient}`
      }`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-0.5"
        />
      ) : null}
    </div>
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
