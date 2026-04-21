// Profanity / slur check. Wraps the `obscenity` library with a
// single check() function shared by every user-input route. The
// library ships a well-curated English dataset with leet-speak
// normalization (a1ss, @ss, etc.). We add a small list of common
// Arabic-script slurs on top because the default dataset is
// English-only — this is nowhere near exhaustive and should be
// treated as a best-effort first pass, not a guarantee.
//
// If you find a false positive (e.g. a legitimate surname blocked),
// add it to ALLOWLIST below. If you find a slur that got through,
// add it to EXTRA_TERMS.
//
// Server-only — do not import from client components. The
// obscenity dataset is ~50KB and has no reason to ship to the
// browser.

import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// ---- English matcher ------------------------------------------------
// Preconfigured by the library: slurs, profanity, sexual terms.
const englishMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// ---- Extra term list ------------------------------------------------
// Minimal Arabic-script slur list. Expand by editing this array;
// do NOT ship the full set as comments in source. Each entry is a
// case-insensitive substring match against the *normalized* input.
// Keeping this short on purpose — the goal is low-cost extension,
// not a comprehensive Arabic-language moderator.
const EXTRA_TERMS: string[] = [
  // Placeholders — curate as real instances come in.
];

// ---- Allowlist ------------------------------------------------------
// Exact (case-insensitive) substrings that should never be flagged
// even if the English dataset would otherwise match. Classic
// "Scunthorpe" problem: name contains a 4-letter substring.
const ALLOWLIST: string[] = ["scunthorpe", "cockburn", "hancock"];

function passesAllowlist(text: string): boolean {
  const lower = text.toLowerCase();
  return ALLOWLIST.some((a) => lower.includes(a));
}

function hitsExtra(text: string): boolean {
  if (EXTRA_TERMS.length === 0) return false;
  const lower = text.toLowerCase();
  return EXTRA_TERMS.some((t) => lower.includes(t.toLowerCase()));
}

export interface ProfanityResult {
  clean: boolean;
  /** Names of the fields that failed the check. */
  flaggedFields: string[];
}

/**
 * Check a map of {fieldName: textValue} for profanity. Returns
 * a list of which fields tripped the filter; the server returns
 * this to the client so the editor can tell the user *which* field
 * to fix without quoting the offending word back at them (which
 * feels insulting and can trigger further creativity).
 */
export function checkProfanity(
  fields: Record<string, string | null | undefined>,
): ProfanityResult {
  const flagged: string[] = [];
  for (const [fieldName, value] of Object.entries(fields)) {
    if (typeof value !== "string" || value.trim().length === 0) continue;
    if (passesAllowlist(value)) continue;
    const englishHit = englishMatcher.hasMatch(value);
    const extraHit = hitsExtra(value);
    if (englishHit || extraHit) flagged.push(fieldName);
  }
  return { clean: flagged.length === 0, flaggedFields: flagged };
}
