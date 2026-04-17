"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Folder, ArrowRight } from "lucide-react";
import { KitProvider, useKit } from "@/lib/kitStore";

/**
 * "Your projects" section on the home page.
 * Only meaningful for signed-in users. Reads from the same localStorage the
 * builder uses, so projects created here appear in the builder sidebar and
 * vice-versa. Clicking a project switches it active and opens /builder.
 */
export function HomeProjects() {
  return (
    <KitProvider>
      <HomeProjectsInner />
    </KitProvider>
  );
}

function HomeProjectsInner() {
  const { projects, createProject, switchProject } = useKit();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // Sort most-recently-updated first.
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleOpen = (id: string) => {
    switchProject(id);
    router.push("/builder");
  };

  const handleNew = () => {
    setCreating(true);
    createProject("Untitled project");
    // KitProvider writes to localStorage synchronously; switching to /builder
    // will pick up the newest project as current.
    router.push("/builder");
  };

  return (
    <section
      id="projects"
      className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950/50 px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
              Your projects
            </h2>
            <p className="mt-2 text-xl text-neutral-100">
              Pick a shoot, or start a new one.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNew}
            disabled={creating}
            className="hidden sm:inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft transition-colors disabled:opacity-60"
          >
            <FolderPlus size={14} />
            New project
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Mobile "New project" card — sibling to project cards */}
          <button
            type="button"
            onClick={handleNew}
            disabled={creating}
            className="group flex flex-col items-start gap-2 rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30 p-5 text-left transition-colors hover:border-accent hover:bg-neutral-900/60 sm:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
              <FolderPlus size={16} />
            </span>
            <span className="text-sm font-medium text-neutral-100">
              New project
            </span>
            <span className="text-xs text-neutral-500">
              Start a fresh gear list.
            </span>
          </button>

          {sorted.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleOpen(p.id)}
              className="group flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 text-left transition-colors hover:border-neutral-700 hover:bg-neutral-900"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Folder size={16} />
                </span>
                <span className="truncate text-sm font-medium text-neutral-100">
                  {p.name || "Untitled project"}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                {p.kit.lines.length}{" "}
                {p.kit.lines.length === 1 ? "line" : "lines"} ·{" "}
                {relativeTime(p.updatedAt)}
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Open builder <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-neutral-600">
          Projects are stored in this browser. Sign in on the same browser to
          find them again — cross-device sync comes later.
        </p>
      </div>
    </section>
  );
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
