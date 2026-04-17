"use client";

import { Plus, ExternalLink } from "lucide-react";
import type { GearItem, RentalHouse } from "@/lib/types";
import { GearImage } from "@/components/GearImage";

interface Props {
  item: GearItem;
  house: RentalHouse | undefined;
  onAdd: () => void;
}

export function GearCard({ item, house, onAdd }: Props) {
  return (
    <div className="group flex flex-col rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-colors">
      {/* Fixed 80px (h-20) image strip — small, compact thumbnail regardless
          of card width. GearImage handles retry + branded placeholder. */}
      <div className="relative h-20">
        <GearImage src={item.imageUrl} alt={item.name} variant="card" />
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
