"use client";

// Client-side filtering for the /crew directory. Takes the full
// server-rendered profile list and lets the viewer search + filter
// in memory. No round-trips to the server per keystroke, and the
// initial server render still gives us SEO-friendly HTML because
// the page.tsx renders <CrewCard/> server-side too — this
// component only replaces the interactive grid once hydrated.

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, ChevronDown, MapPin, CalendarCheck } from "lucide-react";
import { ALL_ROLES } from "@/lib/crewTypes";
import type { CrewProfilePublic } from "@/lib/crewTypes";
import { CrewCard } from "./components/CrewCard";

// Stagger container: children animate in one after another. Small
// delay between so 10+ cards don't feel jittery.
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

interface Props {
  profiles: CrewProfilePublic[];
}

export function CrewDirectoryClient({ profiles }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initial state comes from the URL so:
  //   - Bookmarking a filtered directory works
  //   - Clicking a profile then hitting Back preserves filters
  //   - Direct-linking a filter combo is possible (share, marketing)
  const [query, setQuery] = useState(() => searchParams?.get("q") ?? "");
  const [selectedRole, setSelectedRole] = useState<string | null>(
    () => searchParams?.get("role") ?? null,
  );
  const [city, setCity] = useState(() => searchParams?.get("city") ?? "");
  const [availableThisMonth, setAvailableThisMonth] = useState(
    () => searchParams?.get("av") === "1",
  );
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Sync filter state back to URL on every change. router.replace
  // doesn't push a new history entry, so hitting Back from a
  // profile returns the user to the filtered grid state as one
  // step rather than requiring multiple back-presses.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (selectedRole) sp.set("role", selectedRole);
    if (city) sp.set("city", city);
    if (availableThisMonth) sp.set("av", "1");
    const qs = sp.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    router.replace(target, { scroll: false });
    // pathname/router are stable; we intentionally depend only on
    // filter values so this runs once per change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedRole, city, availableThisMonth]);

  // Pre-compute the set of cities actually in the data so the
  // city filter autocompletes to real values rather than making
  // users guess spelling.
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of profiles) {
      if (p.city?.trim()) set.add(p.city.trim());
    }
    return Array.from(set).sort();
  }, [profiles]);

  // Today's YYYY-MM-DD + first/last of current month — used by the
  // "available this month" toggle so we don't depend on timezone
  // math at render time.
  const { monthStart, monthEnd } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const iso = (d: number) =>
      `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const last = new Date(y, m + 1, 0).getDate();
    return { monthStart: iso(1), monthEnd: iso(last) };
  }, []);

  const filtered = useMemo(() => {
    const tokens = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const cityLower = city.trim().toLowerCase();
    return profiles.filter((p) => {
      if (selectedRole && !p.roles.includes(selectedRole)) return false;
      if (cityLower && !p.city?.toLowerCase().includes(cityLower))
        return false;
      if (availableThisMonth) {
        const inMonth = p.availableDates.some(
          (d) => d >= monthStart && d <= monthEnd,
        );
        if (!inMonth) return false;
      }
      if (tokens.length > 0) {
        const hay = [
          p.displayName,
          p.headline ?? "",
          p.bio ?? "",
          p.city ?? "",
          ...p.roles,
        ]
          .join(" ")
          .toLowerCase();
        if (!tokens.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [profiles, query, selectedRole, city, availableThisMonth, monthStart, monthEnd]);

  const clearFilters = () => {
    setQuery("");
    setSelectedRole(null);
    setCity("");
    setAvailableThisMonth(false);
  };
  const anyFilterActive =
    query.length > 0 ||
    selectedRole !== null ||
    city.length > 0 ||
    availableThisMonth;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, bio — e.g. 'DP gimbal Dubai'"
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-9 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-accent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Role dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                selectedRole
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
              }`}
            >
              {selectedRole ?? "All roles"}
              <ChevronDown size={12} />
            </button>
            {roleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div className="absolute right-0 z-40 mt-1 max-h-80 w-60 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setRoleMenuOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                      !selectedRole ? "text-accent" : "text-neutral-200"
                    }`}
                  >
                    All roles
                  </button>
                  <div className="border-t border-neutral-800" />
                  {ALL_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleMenuOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                        selectedRole === role
                          ? "text-accent"
                          : "text-neutral-200"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* City */}
          <div className="relative">
            <MapPin
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              list="crew-cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-36 rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-accent"
            />
            <datalist id="crew-cities">
              {cityOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setAvailableThisMonth((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors ${
              availableThisMonth
                ? "border-accent bg-accent/10 text-accent"
                : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
            }`}
          >
            <CalendarCheck size={12} />
            Available this month
          </button>
          <span className="text-neutral-500">
            {filtered.length} of {profiles.length}{" "}
            {profiles.length === 1 ? "profile" : "profiles"}
          </span>
          {anyFilterActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-neutral-400 hover:text-neutral-200"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 px-6 py-20 text-center">
            <p className="text-sm text-neutral-300">No crew match those filters.</p>
            <p className="mt-1 text-xs text-neutral-500">
              Try broadening your search or{" "}
              <button
                type="button"
                onClick={clearFilters}
                className="underline hover:text-neutral-300"
              >
                clear filters
              </button>
              .
            </p>
          </div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            // `key` keyed on the filter fingerprint so changing
            // filters replays the stagger — feels responsive.
            key={`${query}-${selectedRole}-${city}-${availableThisMonth}`}
          >
            {filtered.map((p) => (
              <CrewCard key={p.id} profile={p} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
