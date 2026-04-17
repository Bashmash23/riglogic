// Smart-Match rule resolver.
import rulesJson from "@/data/smartMatch.json";
import { getGear } from "./catalog";
import type { GearItem } from "./types";

export const SUGGESTION_CATEGORIES = [
  "Support",
  "Power",
  "Lens Mount",
  "Media",
  "Monitoring",
  "Handheld Rig",
] as const;

export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

interface RawSuggestion {
  gearItemId: string;
  why: string;
}

interface RawRule {
  cameraName: string;
  categories: Record<string, RawSuggestion[]>;
}

const RULES: Record<string, RawRule> = rulesJson as Record<string, RawRule>;

export interface ResolvedSuggestion {
  primaryId: string;
  suggestionId: string; // == gearItemId, unique per primary+category
  category: SuggestionCategory;
  why: string;
  gear: GearItem;
  dismissed: boolean;
}

export interface ResolvedPrimary {
  primaryId: string;
  primaryName: string;
  groups: {
    category: SuggestionCategory;
    suggestions: ResolvedSuggestion[];
  }[];
  totalSuggestions: number;
  dismissedCount: number;
}

export function hasRulesFor(gearItemId: string): boolean {
  return Boolean(RULES[gearItemId]);
}

export function resolveForPrimary(
  primaryId: string,
  dismissed: string[],
): ResolvedPrimary | null {
  const rule = RULES[primaryId];
  if (!rule) return null;

  const dismissedSet = new Set(dismissed);
  const groups: ResolvedPrimary["groups"] = [];
  let total = 0;
  let dismissedCount = 0;

  for (const cat of SUGGESTION_CATEGORIES) {
    const raw = rule.categories[cat] ?? [];
    if (raw.length === 0) continue;
    const suggestions: ResolvedSuggestion[] = [];
    for (const s of raw) {
      const gear = getGear(s.gearItemId);
      if (!gear) continue;
      const key = `${primaryId}:${s.gearItemId}`;
      const isDismissed = dismissedSet.has(key);
      if (isDismissed) dismissedCount++;
      total++;
      suggestions.push({
        primaryId,
        suggestionId: s.gearItemId,
        category: cat,
        why: s.why,
        gear,
        dismissed: isDismissed,
      });
    }
    if (suggestions.length > 0) {
      groups.push({ category: cat, suggestions });
    }
  }

  return {
    primaryId,
    primaryName: rule.cameraName,
    groups,
    totalSuggestions: total,
    dismissedCount,
  };
}

/**
 * Collect one resolved primary per unique primary gear item in the kit that
 * has Smart-Match rules. Preserves insertion order via `lineAddedAt`.
 */
export function resolvePrimariesInKit(
  lines: { gearItemId: string; addedAt: number }[],
  dismissed: string[],
): ResolvedPrimary[] {
  const firstSeen = new Map<string, number>();
  for (const line of lines) {
    if (!hasRulesFor(line.gearItemId)) continue;
    const prev = firstSeen.get(line.gearItemId);
    if (prev === undefined || line.addedAt < prev) {
      firstSeen.set(line.gearItemId, line.addedAt);
    }
  }
  return Array.from(firstSeen.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => resolveForPrimary(id, dismissed))
    .filter((x): x is ResolvedPrimary => x !== null);
}
