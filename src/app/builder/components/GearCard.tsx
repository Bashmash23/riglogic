"use client";

import { useState } from "react";
import { Plus, ExternalLink } from "lucide-react";
import type { GearItem, RentalHouse } from "@/lib/types";

interface Props {
  item: GearItem;
  house: RentalHouse | undefined;
  onAdd: () => void;
}

// Deterministic category → gradient palette for the image fallback.
const CATEGORY_GRADIENTS: Record<string, string> = {
  Cameras: "from-amber-900/40 to-orange-800/30",
  Lenses: "from-sky-900/40 to-blue-800/30",
  Lighting: "from-yellow-900/40 to-amber-700/30",
  Grip: "from-neutral-800/60 to-neutral-700/40",
  Audio: "from-purple-900/40 to-fuchsia-800/30",
  Monitoring: "from-emerald-900/40 to-teal-800/30",
  Power: "from-red-900/40 to-rose-800/30",
  Media: "from-indigo-900/40 to-violet-800/30",
  Accessories: "from-stone-800/60 to-zinc-700/40",
};

export function GearCard({ item, house, onAdd }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const gradient =
    CATEGORY_GRADIENTS[item.category] ?? "from-neutral-800 to-neutral-700";
  const showImage = !!item.imageUrl && !imageFailed;

  return (
    <div className="group flex flex-col rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-colors">
      <div
        className={`relative aspect-[16/9] ${
          showImage
            ? "bg-neutral-950"
            : `bg-gradient-to-br ${gradient}`
        } flex items-center justify-center`}
      >
        {showImage ? (
          // Plain <img> keeps us off the Next.js remote-image allowlist and
          // lets us silently fall back to the category gradient on error.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl ?? undefined}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-xs font-medium tracking-wide text-neutral-300/70 uppercase">
            {item.category}
          </span>
        )}
        {item.isPrimary && (
          <span className="absolute top-2 left-2 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-950">
            Primary
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 gap-2">
        <div>
          <h3 className="text-sm font-medium leading-tight text-neutral-100">
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
            {item.blurb}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="text-xs">
            <div className="font-medium text-neutral-200">
              AED {item.dayRateAED.toLocaleString()}
              <span className="text-neutral-500 font-normal"> / day</span>
            </div>
            {house && (
              <a
                href={house.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-300"
              >
                {house.name}
                <ExternalLink size={10} />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
