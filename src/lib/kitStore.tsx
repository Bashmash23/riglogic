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

// Storage keys.
const LEGACY_KIT_KEY = "riglogic.kit.v1"; // single-kit storage (pre multi-project)
const STORAGE_KEY = "riglogic.projects.v1"; // multi-project storage

// ---- Types ----

export interface KitProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  kit: Kit;
}

interface ProjectsState {
  currentId: string | null;
  projects: KitProject[];
}

// ---- Helpers ----

function emptyKit(): Kit {
  return {
    projectName: "",
    startDate: null,
    endDate: null,
    lines: [],
    dismissedSuggestions: [],
  };
}

function makeId(prefix: string = "p"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function makeLineId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makeProject(name: string = "Untitled project"): KitProject {
  const now = Date.now();
  return {
    id: makeId("proj"),
    name,
    createdAt: now,
    updatedAt: now,
    kit: { ...emptyKit(), projectName: name },
  };
}

function emptyState(): ProjectsState {
  const seed = makeProject("Untitled project");
  return { currentId: seed.id, projects: [seed] };
}

function loadState(): ProjectsState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectsState;
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        // Make sure every project has a valid kit shape.
        const projects = parsed.projects.map((p) => ({
          ...p,
          kit: { ...emptyKit(), ...(p.kit ?? {}) },
        }));
        const currentId =
          projects.find((p) => p.id === parsed.currentId)?.id ?? projects[0].id;
        return { currentId, projects };
      }
    }

    // Migrate legacy single-kit storage if present.
    const legacy = window.localStorage.getItem(LEGACY_KIT_KEY);
    if (legacy) {
      const kit = { ...emptyKit(), ...(JSON.parse(legacy) as Partial<Kit>) };
      const project: KitProject = {
        id: makeId("proj"),
        name: kit.projectName || "Untitled project",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        kit,
      };
      const migrated: ProjectsState = {
        currentId: project.id,
        projects: [project],
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        window.localStorage.removeItem(LEGACY_KIT_KEY);
      } catch {
        /* ignore */
      }
      return migrated;
    }
  } catch {
    // fall through to empty state
  }
  return emptyState();
}

function saveState(state: ProjectsState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota or private mode — silently ignore.
  }
}

// ---- Context ----

interface KitContextValue {
  /** The kit for the currently selected project. */
  kit: Kit;
  /** All projects (for the switcher UI). */
  projects: KitProject[];
  /** The currently selected project. */
  currentProject: KitProject;

  // Project management
  createProject: (name?: string) => string;
  switchProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => string;

  // Kit mutations (operate on the current project)
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
  const [state, setState] = useState<ProjectsState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const currentProject = useMemo(() => {
    return (
      state.projects.find((p) => p.id === state.currentId) ??
      state.projects[0]
    );
  }, [state]);

  const kit = currentProject?.kit ?? emptyKit();

  // Internal helper: mutate the current project's kit.
  const updateCurrentKit = useCallback(
    (fn: (prev: Kit) => Kit) => {
      setState((prev) => {
        const cid = prev.currentId;
        if (!cid) return prev;
        const now = Date.now();
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === cid
              ? { ...p, kit: fn(p.kit), updatedAt: now }
              : p,
          ),
        };
      });
    },
    [],
  );

  // --- Project management ---

  const createProject = useCallback((name?: string) => {
    const project = makeProject(name || "Untitled project");
    setState((prev) => ({
      currentId: project.id,
      projects: [...prev.projects, project],
    }));
    return project.id;
  }, []);

  const switchProject = useCallback((projectId: string) => {
    setState((prev) => {
      if (!prev.projects.some((p) => p.id === projectId)) return prev;
      return { ...prev, currentId: projectId };
    });
  }, []);

  const renameProject = useCallback((projectId: string, name: string) => {
    const trimmed = name.trim() || "Untitled project";
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              name: trimmed,
              // Keep the kit.projectName in sync so PDF/share snapshots
              // pick up the renamed title without an extra field.
              kit: { ...p.kit, projectName: trimmed },
              updatedAt: Date.now(),
            }
          : p,
      ),
    }));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setState((prev) => {
      const remaining = prev.projects.filter((p) => p.id !== projectId);
      if (remaining.length === 0) {
        // Always keep at least one project in the list.
        const seed = makeProject("Untitled project");
        return { currentId: seed.id, projects: [seed] };
      }
      const nextCurrentId =
        prev.currentId === projectId ? remaining[0].id : prev.currentId;
      return { currentId: nextCurrentId, projects: remaining };
    });
  }, []);

  const duplicateProject = useCallback((projectId: string) => {
    let newId = "";
    setState((prev) => {
      const source = prev.projects.find((p) => p.id === projectId);
      if (!source) return prev;
      const now = Date.now();
      newId = makeId("proj");
      const copy: KitProject = {
        id: newId,
        name: `${source.name} (copy)`,
        createdAt: now,
        updatedAt: now,
        kit: {
          ...source.kit,
          projectName: `${source.kit.projectName || source.name} (copy)`,
          lines: source.kit.lines.map((l) => ({ ...l, lineId: makeLineId() })),
          dismissedSuggestions: [...source.kit.dismissedSuggestions],
        },
      };
      return { currentId: copy.id, projects: [...prev.projects, copy] };
    });
    return newId;
  }, []);

  // --- Kit mutations ---

  const addItem = useCallback(
    (gearItemId: string, quantity: number = 1) => {
      updateCurrentKit((prev) => ({
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
    [updateCurrentKit],
  );

  const addMany = useCallback(
    (gearItemIds: string[]) => {
      updateCurrentKit((prev) => {
        const now = Date.now();
        const newLines: KitLine[] = gearItemIds.map((id, idx) => ({
          lineId: makeLineId(),
          gearItemId: id,
          quantity: 1,
          addedAt: now + idx,
        }));
        return { ...prev, lines: [...prev.lines, ...newLines] };
      });
    },
    [updateCurrentKit],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      updateCurrentKit((prev) => ({
        ...prev,
        lines: prev.lines.filter((line) => line.lineId !== lineId),
      }));
    },
    [updateCurrentKit],
  );

  const duplicateLine = useCallback(
    (lineId: string) => {
      updateCurrentKit((prev) => {
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
    },
    [updateCurrentKit],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      const safe = Math.max(1, Math.min(99, Math.floor(quantity)));
      updateCurrentKit((prev) => ({
        ...prev,
        lines: prev.lines.map((line) =>
          line.lineId === lineId ? { ...line, quantity: safe } : line,
        ),
      }));
    },
    [updateCurrentKit],
  );

  const setProjectName = useCallback(
    (name: string) => {
      const trimmed = name.trim() || "Untitled project";
      setState((prev) => {
        const cid = prev.currentId;
        if (!cid) return prev;
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === cid
              ? {
                  ...p,
                  name: trimmed,
                  kit: { ...p.kit, projectName: name },
                  updatedAt: Date.now(),
                }
              : p,
          ),
        };
      });
    },
    [],
  );

  const setDates = useCallback(
    (start: string | null, end: string | null) => {
      updateCurrentKit((prev) => ({ ...prev, startDate: start, endDate: end }));
    },
    [updateCurrentKit],
  );

  const dismissSuggestion = useCallback(
    (primaryId: string, suggestionId: string) => {
      updateCurrentKit((prev) => {
        const key = `${primaryId}:${suggestionId}`;
        if (prev.dismissedSuggestions.includes(key)) return prev;
        return {
          ...prev,
          dismissedSuggestions: [...prev.dismissedSuggestions, key],
        };
      });
    },
    [updateCurrentKit],
  );

  const restoreSuggestions = useCallback(
    (primaryId: string) => {
      updateCurrentKit((prev) => ({
        ...prev,
        dismissedSuggestions: prev.dismissedSuggestions.filter(
          (key) => !key.startsWith(`${primaryId}:`),
        ),
      }));
    },
    [updateCurrentKit],
  );

  const reset = useCallback(() => {
    updateCurrentKit(() => emptyKit());
  }, [updateCurrentKit]);

  const value = useMemo<KitContextValue>(
    () => ({
      kit,
      projects: state.projects,
      currentProject,
      createProject,
      switchProject,
      renameProject,
      deleteProject,
      duplicateProject,
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
      state.projects,
      currentProject,
      createProject,
      switchProject,
      renameProject,
      deleteProject,
      duplicateProject,
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
