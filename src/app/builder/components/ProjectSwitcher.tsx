"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Copy,
  FolderPlus,
  Pencil,
  Trash2,
  Check,
  Folder,
} from "lucide-react";
import { useKit } from "@/lib/kitStore";

/**
 * Compact project switcher shown at the top of the kit sidebar.
 * Lets the user create/switch/rename/duplicate/delete projects.
 */
export function ProjectSwitcher() {
  const {
    projects,
    currentProject,
    createProject,
    switchProject,
    renameProject,
    deleteProject,
    duplicateProject,
  } = useKit();

  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setRenaming(null);
        setConfirmDelete(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const startRename = (projectId: string, currentName: string) => {
    setRenaming(projectId);
    setRenameDraft(currentName);
  };

  const commitRename = () => {
    if (renaming) {
      renameProject(renaming, renameDraft);
    }
    setRenaming(null);
    setRenameDraft("");
  };

  const handleNew = () => {
    createProject("Untitled project");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Project
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-sm font-medium text-neutral-100 hover:border-neutral-700"
      >
        <span className="inline-flex items-center gap-2 truncate">
          <Folder size={14} className="text-accent" />
          <span className="truncate">
            {currentProject?.name || "Untitled project"}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[11px] text-neutral-500">
          {projects.length} project{projects.length === 1 ? "" : "s"}
          <ChevronDown size={14} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 shadow-xl">
          <button
            type="button"
            onClick={handleNew}
            className="flex w-full items-center gap-2 border-b border-neutral-800 px-3 py-2 text-left text-sm text-accent hover:bg-neutral-900"
          >
            <FolderPlus size={14} />
            New project
          </button>

          <ul className="divide-y divide-neutral-900">
            {projects.map((p) => {
              const isCurrent = p.id === currentProject?.id;
              const isRenaming = renaming === p.id;
              const isConfirmingDelete = confirmDelete === p.id;
              return (
                <li key={p.id} className="px-3 py-2">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        switchProject(p.id);
                        setOpen(false);
                      }}
                      className="group min-w-0 flex-1 text-left"
                    >
                      {isRenaming ? (
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          onBlur={commitRename}
                          className="w-full rounded border border-accent bg-neutral-900 px-2 py-1 text-sm text-neutral-100 focus:outline-none"
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <Check size={12} className="text-accent" />
                            )}
                            <span
                              className={`truncate text-sm ${
                                isCurrent
                                  ? "font-medium text-neutral-100"
                                  : "text-neutral-300 group-hover:text-neutral-100"
                              }`}
                            >
                              {p.name}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-neutral-500">
                            {p.kit.lines.length} line
                            {p.kit.lines.length === 1 ? "" : "s"} ·{" "}
                            {relativeTime(p.updatedAt)}
                          </div>
                        </>
                      )}
                    </button>
                    {!isRenaming && !isConfirmingDelete && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <IconButton
                          onClick={() => startRename(p.id, p.name)}
                          label="Rename"
                          icon={<Pencil size={12} />}
                        />
                        <IconButton
                          onClick={() => duplicateProject(p.id)}
                          label="Duplicate"
                          icon={<Copy size={12} />}
                        />
                        <IconButton
                          onClick={() => setConfirmDelete(p.id)}
                          label="Delete"
                          icon={<Trash2 size={12} />}
                          hover="hover:text-red-400"
                        />
                      </div>
                    )}
                    {isConfirmingDelete && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            deleteProject(p.id);
                            setConfirmDelete(null);
                          }}
                          className="rounded bg-red-500/20 px-2 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="rounded px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  icon,
  hover = "hover:text-neutral-100",
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  hover?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded p-1 text-neutral-500 ${hover} hover:bg-neutral-800`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
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
