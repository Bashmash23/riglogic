"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Plus,
  Sparkles,
  X,
  Lock,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";
import { useKit } from "@/lib/kitStore";
import {
  resolvePrimariesInKit,
  type ResolvedPrimary,
  type ResolvedSuggestion,
} from "@/lib/smartMatch";

export function SmartMatchPanel() {
  const { kit, addItem, addMany, dismissSuggestion, restoreSuggestions } =
    useKit();

  const primaries = useMemo<ResolvedPrimary[]>(
    () =>
      resolvePrimariesInKit(
        kit.lines.map((l) => ({
          gearItemId: l.gearItemId,
          addedAt: l.addedAt,
        })),
        kit.dismissedSuggestions,
      ),
    [kit.lines, kit.dismissedSuggestions],
  );

  if (primaries.length === 0) return null;

  return (
    <section className="rounded-lg border border-accent/30 bg-accent/5 p-4">
      <header className="flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-neutral-100">
          Smart-Match suggestions
        </h2>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
          {primaries.length} primary
          {primaries.length === 1 ? "" : "s"}
        </span>
      </header>
      <p className="mt-1 text-xs text-neutral-400">
        Compatible essentials for the primary items in your kit. Click
        <span className="mx-1 rounded bg-neutral-900 px-1 py-0.5 text-[10px] text-neutral-200">
          Add
        </span>
        to queue one, or
        <span className="mx-1 rounded bg-neutral-900 px-1 py-0.5 text-[10px] text-neutral-200">
          Add all
        </span>
        for the whole primary.
      </p>

      <div className="mt-4 space-y-3">
        {primaries.map((p) => (
          <PrimaryBlock
            key={p.primaryId}
            primary={p}
            onAdd={(id) => addItem(id)}
            onAddAll={(ids) => addMany(ids)}
            onDismiss={dismissSuggestion}
            onRestore={restoreSuggestions}
          />
        ))}
      </div>
    </section>
  );
}

function PrimaryBlock({
  primary,
  onAdd,
  onAddAll,
  onDismiss,
  onRestore,
}: {
  primary: ResolvedPrimary;
  onAdd: (gearItemId: string) => void;
  onAddAll: (gearItemIds: string[]) => void;
  onDismiss: (primaryId: string, suggestionId: string) => void;
  onRestore: (primaryId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [showDismissed, setShowDismissed] = useState(false);

  const visibleGroups = primary.groups
    .map((g) => ({
      ...g,
      suggestions: g.suggestions.filter(
        (s) => showDismissed || !s.dismissed,
      ),
    }))
    .filter((g) => g.suggestions.length > 0);

  const visibleSuggestionIds = visibleGroups.flatMap((g) =>
    g.suggestions.filter((s) => !s.dismissed).map((s) => s.suggestionId),
  );

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-neutral-100 truncate">
            {primary.primaryName}
          </div>
          <div className="text-[11px] text-neutral-500">
            {primary.totalSuggestions - primary.dismissedCount} active
            {primary.dismissedCount > 0 &&
              ` · ${primary.dismissedCount} dismissed`}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-neutral-800">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-800 bg-neutral-900/40">
            <button
              type="button"
              onClick={() => onAddAll(visibleSuggestionIds)}
              disabled={visibleSuggestionIds.length === 0}
              className="inline-flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-xs font-medium text-neutral-950 hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
            >
              <Plus size={12} />
              Add all ({visibleSuggestionIds.length})
            </button>
            {primary.dismissedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowDismissed((s) => !s);
                  if (showDismissed) onRestore(primary.primaryId);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200"
              >
                <RotateCcw size={11} />
                {showDismissed ? "Restore all" : "Show dismissed"}
              </button>
            )}
          </div>

          {visibleGroups.length === 0 ? (
            <p className="px-3 py-4 text-xs text-neutral-500">
              All suggestions dismissed. Click &ldquo;Show dismissed&rdquo; to
              bring them back.
            </p>
          ) : (
            <div className="divide-y divide-neutral-900">
              {visibleGroups.map((g) => (
                <div key={g.category} className="px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {g.category}
                  </div>
                  <ul className="mt-2 space-y-2">
                    {g.suggestions.map((s) => (
                      <SuggestionRow
                        key={s.suggestionId}
                        suggestion={s}
                        onAdd={() => onAdd(s.suggestionId)}
                        onDismiss={() =>
                          onDismiss(s.primaryId, s.suggestionId)
                        }
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <ProLockedPanel primaryName={primary.primaryName} />
        </div>
      )}
    </div>
  );
}

function SuggestionRow({
  suggestion,
  onAdd,
  onDismiss,
}: {
  suggestion: ResolvedSuggestion;
  onAdd: () => void;
  onDismiss: () => void;
}) {
  return (
    <li
      className={`flex items-start gap-3 rounded border ${
        suggestion.dismissed
          ? "border-neutral-900 bg-neutral-950 opacity-60"
          : "border-neutral-800 bg-neutral-900/40"
      } p-2.5`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-neutral-100">
          {suggestion.gear.name}
        </div>
        <div className="mt-0.5 text-[11px] text-neutral-500">
          AED {suggestion.gear.dayRateAED.toLocaleString()}/day
        </div>
        <p className="mt-1.5 text-xs leading-snug text-neutral-400">
          {suggestion.why}
        </p>
      </div>
      {!suggestion.dismissed && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
          >
            <Plus size={12} />
            Add
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </li>
  );
}

function ProLockedPanel({ primaryName }: { primaryName: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "busy") return;
    if (!email || !email.includes("@")) {
      setStatus("err");
      setMessage("Please enter a valid email.");
      return;
    }
    setStatus("busy");
    setMessage(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "pro-tier" }),
      });
      if (res.ok) {
        setStatus("ok");
        setMessage("You're on the list. We'll be in touch.");
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus("err");
        setMessage(
          data.error === "db_unavailable"
            ? "Waitlist isn't hooked up yet — try again after setup."
            : "Couldn't save your email. Please try again.",
        );
      }
    } catch {
      setStatus("err");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="border-t border-dashed border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900/60 px-3 py-3">
      <div className="flex items-start gap-2">
        <Lock size={14} className="mt-0.5 text-accent" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-neutral-100">
            Pro · Deep conditional logic
          </div>
          <p className="mt-1 text-[11px] leading-snug text-neutral-400">
            Handheld vs. sticks, interior vs. exterior, shoot duration — Pro
            narrows suggestions to what you actually need for{" "}
            <span className="text-neutral-300">{primaryName}</span>. Join the
            waitlist.
          </p>
          {status === "ok" ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-emerald-900/30 px-2 py-1 text-[11px] text-emerald-300">
              <Check size={12} />
              {message}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-2 flex gap-1.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@production.com"
                className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={status === "busy"}
                className="inline-flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-xs font-medium text-neutral-950 hover:bg-accent-soft disabled:opacity-60"
              >
                {status === "busy" ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Joining
                  </>
                ) : (
                  "Join waitlist"
                )}
              </button>
            </form>
          )}
          {status === "err" && message && (
            <p className="mt-1 text-[11px] text-red-400">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
