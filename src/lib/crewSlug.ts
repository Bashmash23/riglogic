// Slug generation for /crew/[slug] URLs.
//
// Rules:
// - Lowercase, ASCII-only (strip accents / non-Latin)
// - Words joined with hyphens
// - Max 48 chars
// - Collision safe: caller should retry with a suffix if the slug
//   is already taken (db-level @unique enforces)

export function slugify(input: string): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return normalized || "crew";
}

/**
 * Append a short random suffix for collision resolution. Keep the
 * base + suffix under 48 chars.
 */
export function slugifyWithSuffix(input: string): string {
  const base = slugify(input).slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
