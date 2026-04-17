// A kit snapshot is the materialized view of a kit that's safe to hand off
// to exporters (PDF, share link, email). It freezes gear item + house data
// so shared kits keep rendering correctly even if the catalog changes later.

import { GEAR, HOUSES, getGear, getHouse } from "./catalog";
import type { Kit, KitLine } from "./types";

export interface SnapshotItem {
  lineId: string;
  name: string;
  category: string;
  quantity: number;
  dayRateAED: number;
  blurb: string;
  house: {
    id: string;
    name: string;
    website: string;
  } | null;
}

export interface KitSnapshot {
  version: 1;
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdByName?: string;
  createdByEmail?: string;
  items: SnapshotItem[];
  rentalDays: number; // 0 means per-day only
}

export function buildSnapshot(
  kit: Kit,
  user?: { name?: string; email?: string },
): KitSnapshot {
  const items: SnapshotItem[] = kit.lines
    .map((line) => materializeLine(line))
    .filter((x): x is SnapshotItem => Boolean(x));

  return {
    version: 1,
    projectName: kit.projectName || "Untitled shoot",
    startDate: kit.startDate,
    endDate: kit.endDate,
    createdAt: new Date().toISOString(),
    createdByName: user?.name,
    createdByEmail: user?.email,
    items,
    rentalDays: computeRentalDays(kit.startDate, kit.endDate),
  };
}

function materializeLine(line: KitLine): SnapshotItem | null {
  const gear = getGear(line.gearItemId);
  if (!gear) return null;
  const house = getHouse(gear.rentalHouseId) ?? null;
  return {
    lineId: line.lineId,
    name: gear.name,
    category: gear.category,
    quantity: line.quantity,
    dayRateAED: gear.dayRateAED,
    blurb: gear.blurb,
    house: house
      ? { id: house.id, name: house.name, website: house.website }
      : null,
  };
}

// Inclusive day count. null dates → 0 (per-day total only).
export function computeRentalDays(
  start: string | null,
  end: string | null,
): number {
  if (!start || !end) return 0;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  const ms = e.getTime() - s.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function snapshotTotals(snap: KitSnapshot) {
  const perDay = snap.items.reduce(
    (sum, it) => sum + it.quantity * it.dayRateAED,
    0,
  );
  const days = snap.rentalDays;
  const lineTotal = days > 0 ? perDay * days : 0;
  return { perDay, days, lineTotal };
}

export function groupByCategory(snap: KitSnapshot): {
  category: string;
  items: SnapshotItem[];
}[] {
  const buckets = new Map<string, SnapshotItem[]>();
  for (const it of snap.items) {
    const arr = buckets.get(it.category) ?? [];
    arr.push(it);
    buckets.set(it.category, arr);
  }
  // preserve a sensible category order
  const CATEGORY_ORDER = [
    "Cameras",
    "Lenses",
    "Lighting",
    "Grip",
    "Audio",
    "Monitoring",
    "Power",
    "Media",
    "Accessories",
  ];
  return CATEGORY_ORDER.filter((c) => buckets.has(c)).map((c) => ({
    category: c,
    items: buckets.get(c)!,
  }));
}

export function groupByHouse(snap: KitSnapshot): {
  houseId: string | null;
  houseName: string;
  houseWebsite: string | null;
  items: SnapshotItem[];
}[] {
  const buckets = new Map<string, SnapshotItem[]>();
  for (const it of snap.items) {
    const key = it.house?.id ?? "__unassigned__";
    const arr = buckets.get(key) ?? [];
    arr.push(it);
    buckets.set(key, arr);
  }
  return Array.from(buckets.entries()).map(([key, items]) => {
    if (key === "__unassigned__") {
      return {
        houseId: null,
        houseName: "Unassigned",
        houseWebsite: null,
        items,
      };
    }
    const house = HOUSES.find((h) => h.id === key);
    return {
      houseId: key,
      houseName: house?.name ?? "Unknown house",
      houseWebsite: house?.website ?? null,
      items,
    };
  });
}

// Silence the unused-import warning when tree-shaken.
export { GEAR };
