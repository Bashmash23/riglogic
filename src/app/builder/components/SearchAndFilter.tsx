"use client";

import { Search, X } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/types";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  category: Category | null;
  onCategoryChange: (c: Category | null) => void;
}

export function SearchAndFilter({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
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
