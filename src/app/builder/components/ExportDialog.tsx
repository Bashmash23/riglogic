"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Check,
  Copy,
  Download,
  Link as LinkIcon,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import { useKit } from "@/lib/kitStore";
import { buildSnapshot } from "@/lib/kitSnapshot";
import { allHouseMailtos } from "@/lib/mailto";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: Props) {
  const { kit } = useKit();
  const { user } = useUser();

  const [pdfBusy, setPdfBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setShareUrl(null);
      setShareError(null);
      setCopied(false);
    }
  }, [open]);

  // Keep escape key closing the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const snapshot = useMemo(() => {
    return buildSnapshot(kit, {
      name: user?.fullName ?? undefined,
      email: user?.primaryEmailAddress?.emailAddress,
    });
  }, [kit, user]);

  const mailtos = useMemo(() => allHouseMailtos(snapshot), [snapshot]);
  const hasItems = snapshot.items.length > 0;

  const handleDownloadPdf = async () => {
    if (!hasItems || pdfBusy) return;
    setPdfBusy(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { KitPdfDocument } = await import("@/lib/pdfDoc");
      const blob = await pdf(<KitPdfDocument snapshot={snapshot} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RigLogic_${slug(snapshot.projectName || "kit")}_${today()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("pdf export failed", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  const handleCreateShare = async () => {
    if (!hasItems || shareBusy) return;
    setShareBusy(true);
    setShareError(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (data.error === "db_unavailable") {
          setShareError(
            "Share links aren't configured yet — the database isn't connected. Try again after setup.",
          );
        } else {
          setShareError("Couldn't create a share link. Please try again.");
        }
        return;
      }
      const data = (await res.json()) as { shortId: string };
      const url = `${window.location.origin}/s/${data.shortId}`;
      setShareUrl(url);
    } catch (err) {
      console.error("share failed", err);
      setShareError("Network error. Please try again.");
    } finally {
      setShareBusy(false);
    }
  };

  const handleCopyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: show the URL so they can copy manually
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Export &amp; share</h2>
            <p className="text-xs text-neutral-500">
              {snapshot.items.length} item
              {snapshot.items.length === 1 ? "" : "s"} ·{" "}
              {snapshot.projectName || "Untitled shoot"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* PDF */}
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Download size={15} className="text-accent" />
                  <h3 className="font-medium">Printable PDF</h3>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Downloads a PDF grouped by category with day rates, totals,
                  and rental house summary.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!hasItems || pdfBusy}
                className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
              >
                {pdfBusy ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Building…
                  </span>
                ) : (
                  "Download PDF"
                )}
              </button>
            </div>
          </section>

          {/* Share link */}
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <LinkIcon size={15} className="text-accent" />
                  <h3 className="font-medium">Shareable link</h3>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  A public read-only URL you can send to a producer or rental
                  house. No account required to view.
                </p>
              </div>
              {!shareUrl && (
                <button
                  type="button"
                  onClick={handleCreateShare}
                  disabled={!hasItems || shareBusy}
                  className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {shareBusy ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Creating…
                    </span>
                  ) : (
                    "Create link"
                  )}
                </button>
              )}
            </div>
            {shareUrl && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs">
                <span className="flex-1 truncate font-mono text-neutral-300">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="inline-flex items-center gap-1 rounded bg-neutral-800 px-2 py-1 text-[11px] font-medium text-neutral-200 hover:bg-neutral-700"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
            {shareError && (
              <p className="mt-2 text-xs text-red-400">{shareError}</p>
            )}
          </section>

          {/* Inquiry emails */}
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-accent" />
              <h3 className="font-medium">Rental inquiry emails</h3>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Opens your mail client with a pre-filled inquiry per rental
              house.
            </p>
            <ul className="mt-3 space-y-1.5">
              {mailtos.length === 0 ? (
                <li className="text-xs text-neutral-500">
                  Add items to draft inquiry emails.
                </li>
              ) : (
                mailtos.map((m) => (
                  <li
                    key={m.houseId ?? m.houseName}
                    className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-neutral-100">
                        {m.houseName}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {m.itemCount} item
                        {m.itemCount === 1 ? "" : "s"}
                      </div>
                    </div>
                    <a
                      href={m.mailto}
                      className="rounded bg-neutral-800 px-2.5 py-1 text-xs text-neutral-100 hover:bg-neutral-700"
                    >
                      Draft email
                    </a>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    || "kit";
}

function today(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
