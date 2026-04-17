"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Kit, KitLine } from "./types";

const STORAGE_KEY = "riglogic.kit.v1";

function emptyKit(): Kit {
  return {
    projectName: "",
    startDate: null,
    endDate: null,
    lines: [],
    dismissedSuggestions: [],
  };
}

function loadKit(): Kit {
  if (typeof window === "undefined") return emptyKit();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyKit();
    const parsed = JSON.parse(raw) as Kit;
    return { ...emptyKit(), ...parsed };
  } catch {
    return emptyKit();
  }
}

function saveKit(kit: Kit) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kit));
  } catch {
    // storage quota or private mode — silently ignore.
  }
}

function makeLineId(): string {
  // Random 8-char ID. Good enough to distinguish duplicate lines in UI.
  return Math.random().toString(36).slice(2, 10);
}

interface KitContextValue {
  kit: Kit;
  addItem: (gearItemId: string, quantity?: number) => void;
  addMany: (gearItemIds: string[]) => void;
  removeLine: (lineId: string) => void;
  duplicateLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  setProjectName: (name: string) => void;
  setDates: (start: string | null, end: string | null) => void;
  dismissSuggestion: (primaryId: string, suggestionId: string) => void;
  restoreSuggestions: (primaryId: string) => void;
  reset: () => void;
}

const KitContext = createContext<KitContextValue | null>(null);

export function KitProvider({ children }: { children: React.ReactNode }) {
  const [kit, setKit] = useState<Kit>(emptyKit);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after first client render.
  useEffect(() => {
    setKit(loadKit());
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    saveKit(kit);
  }, [kit, hydrated]);

  const addItem = useCallback(
    (gearItemId: string, quantity: number = 1) => {
      setKit((prev) => ({
        ...prev,
        lines: [
          ...prev.lines,
          {
            lineId: makeLineId(),
            gearItemId,
            quantity,
            addedAt: Date.now(),
          },
        ],
      }));
    },
    [],
  );

  const addMany = useCallback((gearItemIds: string[]) => {
    setKit((prev) => {
      const now = Date.now();
      const newLines: KitLine[] = gearItemIds.map((id, idx) => ({
        lineId: makeLineId(),
        gearItemId: id,
        quantity: 1,
        addedAt: now + idx,
      }));
      return { ...prev, lines: [...prev.lines, ...newLines] };
    });
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setKit((prev) => ({
      ...prev,
      lines: prev.lines.filter((line) => line.lineId !== lineId),
    }));
  }, []);

  const duplicateLine = useCallback((lineId: string) => {
    setKit((prev) => {
      const line = prev.lines.find((l) => l.lineId === lineId);
      if (!line) return prev;
      return {
        ...prev,
        lines: [
          ...prev.lines,
          { ...line, lineId: makeLineId(), addedAt: Date.now() },
        ],
      };
    });
  }, []);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    const safe = Math.max(1, Math.min(99, Math.floor(quantity)));
    setKit((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.lineId === lineId ? { ...line, quantity: safe } : line,
      ),
    }));
  }, []);

  const setProjectName = useCallback((name: string) => {
    setKit((prev) => ({ ...prev, projectName: name }));
  }, []);

  const setDates = useCallback((start: string | null, end: string | null) => {
    setKit((prev) => ({ ...prev, startDate: start, endDate: end }));
  }, []);

  const dismissSuggestion = useCallback(
    (primaryId: string, suggestionId: string) => {
      setKit((prev) => {
        const key = `${primaryId}:${suggestionId}`;
        if (prev.dismissedSuggestions.includes(key)) return prev;
        return {
          ...prev,
          dismissedSuggestions: [...prev.dismissedSuggestions, key],
        };
      });
    },
    [],
  );

  const restoreSuggestions = useCallback((primaryId: string) => {
    setKit((prev) => ({
      ...prev,
      dismissedSuggestions: prev.dismissedSuggestions.filter(
        (key) => !key.startsWith(`${primaryId}:`),
      ),
    }));
  }, []);

  const reset = useCallback(() => {
    setKit(emptyKit());
  }, []);

  const value = useMemo<KitContextValue>(
    () => ({
      kit,
      addItem,
      addMany,
      removeLine,
      duplicateLine,
      setQuantity,
      setProjectName,
      setDates,
      dismissSuggestion,
      restoreSuggestions,
      reset,
    }),
    [
      kit,
      addItem,
      addMany,
      removeLine,
      duplicateLine,
      setQuantity,
      setProjectName,
      setDates,
      dismissSuggestion,
      restoreSuggestions,
      reset,
    ],
  );

  return <KitContext.Provider value={value}>{children}</KitContext.Provider>;
}

export function useKit() {
  const ctx = useContext(KitContext);
  if (!ctx) throw new Error("useKit must be used inside <KitProvider>");
  return ctx;
}
