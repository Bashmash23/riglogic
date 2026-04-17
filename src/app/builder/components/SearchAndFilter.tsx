"use client";

import { useState } from "react";
import { Search, X, ChevronDown, Building2 } from "lucide-react";
import { CATEGORIES, type Category, type RentalHouse } from "@/lib/types";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  category: Category | null;
  onCategoryChange: (c: Category | null) => void;
  houseId: string | null;
  onHouseChange: (h: string | null) => void;
  houses: RentalHouse[];
}

export function SearchAndFilter({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  houseId,
  onHouseChange,
  houses,
}: Props) {
  const [houseMenuOpen, setHouseMenuOpen] = useState(false);
  const activeHouse = houseId
    ? houses.find((h) => h.id === houseId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            size={16}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search gear — try 'alexa', '416', 'v-mount'"
            className="w-full rounded-md bg-neutral-900 border border-neutral-800 pl-9 pr-9 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Rental-house filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setHouseMenuOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2.5 text-sm transition-colors ${
              activeHouse
                ? "border-accent bg-accent/10 text-accent"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
            }`}
          >
            <Building2 size={14} />
            <span className="hidden sm:inline">
              {activeHouse ? activeHouse.name : "All houses"}
            </span>
            <span className="sm:hidden">
              {activeHouse ? "House" : "Houses"}
            </span>
            <ChevronDown size={14} />
          </button>
          {houseMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setHouseMenuOpen(false)}
              />
              <div className="absolute right-0 z-40 mt-1 w-56 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    onHouseChange(null);
                    setHouseMenuOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                    !activeHouse ? "text-accent" : "text-neutral-200"
                  }`}
                >
                  All houses
                </button>
                <div className="border-t border-neutral-800" />
                {houses.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      onHouseChange(h.id);
                      setHouseMenuOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                      activeHouse?.id === h.id
                        ? "text-accent"
                        : "text-neutral-200"
                    }`}
                  >
                    <div className="font-medium">{h.name}</div>
                    <div className="text-[11px] text-neutral-500">
                      {h.specialty}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          label="All"
          active={category === null}
          onClick={() => onCategoryChange(null)}
        />
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={category === cat}
            onClick={() => onCategoryChange(cat === category ? null : cat)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
      }`}
    >
      {label}
    </button>
  );
}
