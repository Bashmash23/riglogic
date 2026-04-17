"use client";

import { useEffect, useState } from "react";
import type { GearItem } from "./types";
import { setScrapedGear } from "./scrapedGearCache";

/**
 * Fetches the live scraped catalog from /api/catalog once when the component
 * mounts. Returns an empty array on first render and while the request is in
 * flight, so the builder stays usable even when the DB is unreachable.
 */
export function useScrapedGear(): { items: GearItem[]; loading: boolean } {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { items?: GearItem[] }) => {
        if (cancelled) return;
        if (Array.isArray(data.items)) {
          setItems(data.items);
          // Also publish to the module cache so getGear() can resolve scraped
          // ids from places that aren't subscribed to this hook (KitSidebar,
          // export, share-link snapshot builder).
          setScrapedGear(data.items);
        }
      })
      .catch(() => {
        // swallow — builder falls back to placeholder-only
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading };
}
