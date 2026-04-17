"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function CrewWaitlistForm() {
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
        body: JSON.stringify({ email, source: "crew" }),
      });
      if (res.ok) {
        setStatus("ok");
        setMessage("Thanks — we'll email you when Crew opens.");
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

  if (status === "ok") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-900 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
        <Check size={16} />
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@production.com"
          className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "busy"}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft disabled:opacity-60"
        >
          {status === "busy" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Joining
            </>
          ) : (
            "Join waitlist"
          )}
        </button>
      </div>
      {status === "err" && message && (
        <p className="text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}
