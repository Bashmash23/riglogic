"use client";

// Shared imperative-style confirm dialog. Replaces the browser's
// native confirm() with something that actually looks like it
// belongs to the product. Usage:
//
//   const confirmed = await confirm({
//     title: "Leave without saving?",
//     description: "Your changes will be lost.",
//     confirmText: "Leave",
//     variant: "danger",
//   });
//   if (!confirmed) return;
//
// Single <ConfirmDialogHost /> mounts at the app root; anywhere in
// the tree can call `confirm()` and await the result.

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useEffect, useState } from "react";

type Variant = "default" | "danger";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

interface OpenState extends ConfirmOptions {
  resolve: (v: boolean) => void;
}

// Module-level queue + listener so imperative confirm() works
// across component boundaries without a React context.
type Listener = (state: OpenState) => void;
let listeners: Listener[] = [];

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const state: OpenState = { ...opts, resolve };
    listeners.forEach((l) => l(state));
  });
}

export function ConfirmDialogHost() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    const listener: Listener = (s) => {
      setState(s);
      setOpen(true);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const close = (result: boolean) => {
    state?.resolve(result);
    setOpen(false);
    // Give Radix's exit animation a moment before clearing state
    // so the text doesn't flicker to empty mid-fade.
    setTimeout(() => setState(null), 200);
  };

  const variant: Variant = state?.variant ?? "default";

  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !o && close(false)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
          <AlertDialog.Title className="text-base font-semibold text-neutral-100">
            {state?.title}
          </AlertDialog.Title>
          {state?.description && (
            <AlertDialog.Description className="mt-2 text-sm text-neutral-400">
              {state.description}
            </AlertDialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                onClick={() => close(false)}
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900/60 px-4 text-sm text-neutral-100 hover:border-neutral-700 hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                {state?.cancelText ?? "Cancel"}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={() => close(true)}
                type="button"
                className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
                  variant === "danger"
                    ? "bg-red-500 text-white hover:bg-red-400 focus-visible:ring-red-400"
                    : "bg-accent text-neutral-950 hover:bg-accent-soft focus-visible:ring-accent"
                }`}
              >
                {state?.confirmText ?? "Confirm"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
