"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { KitProvider, useKit } from "@/lib/kitStore";
import { GEAR, HOUSES, getHouse, searchGear } from "@/lib/catalog";
import { useScrapedGear } from "@/lib/useScrapedGear";
import type { Category, GearItem } from "@/lib/types";
import { SearchAndFilter } from "./components/SearchAndFilter";
import { GearCard } from "./components/GearCard";
import { KitSidebar } from "./components/KitSidebar";
import { ExportDialog } from "./components/ExportDialog";
import { ExportFab } from "./components/ExportFab";
import { SmartMatchPanel } from "./components/SmartMatchPanel";

export function BuilderShell() {
  return (
    <KitProvider>
      <BuilderLayout />
    </KitProvider>
  );
}

function BuilderLayout() {
  const { addItem } = useKit();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [houseId, setHouseId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const { items: scrapedItems, loading: scrapedLoading } = useScrapedGear();

  // Option X (mix mode): merge placeholder catalog with live scraped items.
  // Placeholder items keep their priority — Smart-Match rules still reference
  // their IDs — and scraped items appear alongside for everything else.
  const mergedCatalog: GearItem[] = useMemo(
    () => [...GEAR, ...scrapedItems],
    [scrapedItems],
  );

  const results: GearItem[] = useMemo(() => {
    let items: GearItem[] = mergedCatalog;
    if (query.trim()) {
      const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        // Placeholder search has a blurb to match against; scraped items don't.
        // Fall back to a simple name/tags search over the merged catalog.
        const placeholderHits = new Set(searchGear(query).map((i) => i.id));
        items = mergedCatalog.filter((i) => {
          if (placeholderHits.has(i.id)) return true;
          const hay = [i.name, i.category, ...i.tags].join(" ").toLowerCase();
          return tokens.every((t) => hay.includes(t));
        });
      }
    }
    if (category) items = items.filter((i) => i.category === category);
    if (houseId) items = items.filter((i) => i.rentalHouseId === houseId);
    return items;
  }, [mergedCatalog, query, category, houseId]);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Rig<span className="text-accent">Logic</span>
          </Link>
          <span className="hidden text-xs text-neutral-500 sm:inline">
            Kit builder
          </span>
        </div>
        <UserButton />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex flex-1 flex-col gap-4 p-6">
          <SmartMatchPanel />

          <SearchAndFilter
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            houseId={houseId}
            onHouseChange={setHouseId}
            houses={HOUSES}
          />

          {results.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 py-20 text-center">
              <p className="text-sm text-neutral-400">No gear matches that.</p>
              <p className="mt-1 text-xs text-neutral-500">
                Try a different search, category, or rental house.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 pb-24 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <GearCard
                  key={item.id}
                  item={item}
                  house={getHouse(item.rentalHouseId)}
                  onAdd={() => addItem(item.id)}
                />
              ))}
            </div>
          )}
        </main>

        <KitSidebar onStartWithCamera={() => setCategory("Cameras")} />
      </div>

      <ExportFab onClick={() => setExportOpen(true)} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
