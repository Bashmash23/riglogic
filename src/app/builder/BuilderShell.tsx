"use client";

import { useMemo, useState } from "react";
import { KitProvider, useKit } from "@/lib/kitStore";
import { GEAR, HOUSES, getHouse, searchGear } from "@/lib/catalog";
import type { Category, GearItem } from "@/lib/types";
import { TopNav } from "@/components/TopNav";
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

  const results: GearItem[] = useMemo(() => {
    let items: GearItem[] = GEAR;
    if (query.trim()) {
      items = searchGear(query);
    }
    if (category) items = items.filter((i) => i.category === category);
    if (houseId) items = items.filter((i) => i.rentalHouseId === houseId);
    return items;
  }, [query, category, houseId]);

  return (
    // On desktop we lock the outer column to exactly 100vh and let the gear
    // grid scroll inside <main>. That way the KitSidebar on the right sits
    // in the flex row at a fixed height and naturally stays on screen as
    // you scroll gear — no position: sticky gymnastics needed, which was
    // unreliable when main content was taller than the viewport.
    // Mobile keeps the old min-h-screen behaviour so the page scrolls
    // naturally and the sidebar stacks below.
    <div className="flex min-h-screen flex-1 flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <TopNav />

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <main className="flex flex-1 flex-col gap-4 p-6 lg:min-h-0 lg:overflow-y-auto">
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
