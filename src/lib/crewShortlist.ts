"use client";

// Shortlist state — a production's personal list of crew they're
// interested in for a shoot. Stored client-side in localStorage so
// it works for anonymous visitors too (no sign-in required to save
// a favourite). Small, single-hook API that any component can
// subscribe to.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "riglogic.crew.shortlist.v1";
const EVENT_NAME = "riglogic:shortlist-changed";

/** The shape stored in localStorage — just the slugs, in the
 *  order they were added. We fetch fresh profile data from the DB
 *  when the shortlist page renders, so nothing here goes stale. */
type Stored = { slugs: string[] };

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Stored;
    if (!Array.isArray(parsed.slugs)) return [];
    return parsed.slugs.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ slugs } satisfies Stored),
    );
    // Notify other components (same tab) that the list changed.
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    /* storage quota, ignore */
  }
}

/**
 * React hook returning the current shortlist and helpers to
 * mutate it. All components that call this share the same state:
 * when one component adds a slug the others re-render thanks to
 * the custom event below + the native "storage" event for
 * cross-tab sync.
 */
export function useShortlist() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSlugs(read());
    setMounted(true);
    const refresh = () => setSlugs(read());
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const add = useCallback((slug: string) => {
    const current = read();
    if (current.includes(slug)) return;
    const next = [...current, slug];
    write(next);
    setSlugs(next);
  }, []);

  const remove = useCallback((slug: string) => {
    const next = read().filter((s) => s !== slug);
    write(next);
    setSlugs(next);
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    write(next);
    setSlugs(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setSlugs([]);
  }, []);

  const has = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  return { slugs, add, remove, toggle, clear, has, mounted };
}
