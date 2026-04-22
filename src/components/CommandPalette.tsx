"use client";

// Cmd+K / Ctrl+K command palette. Single place to jump anywhere
// in RigLogic. Links through to all public pages + the user's own
// profile editor when signed-in. Can be opened from anywhere via
// the keyboard shortcut or the TopNav button.
//
// Uses cmdk (the same library Linear / Vercel / Raycast style
// palettes are built on) and Radix Dialog for focus management +
// outside-click dismiss.

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Search,
  Home,
  Users,
  Bookmark,
  UserCircle2,
  FileText,
  Mail,
  Scale,
  Wrench,
} from "lucide-react";

interface Action {
  label: string;
  /** Extra search tokens beyond the label so e.g. "home" also
   *  matches "landing" or "start". */
  keywords?: string[];
  icon: React.ReactNode;
  href: string;
  signedInOnly?: boolean;
  section: "Navigate" | "Account" | "Help";
}

const ACTIONS: Action[] = [
  { label: "Home", keywords: ["landing", "start"], icon: <Home size={14} />, href: "/", section: "Navigate" },
  { label: "Builder", keywords: ["gear", "kit", "list", "build"], icon: <Wrench size={14} />, href: "/builder", section: "Navigate", signedInOnly: true },
  { label: "Crew directory", keywords: ["freelancers", "dp", "ac", "crew"], icon: <Users size={14} />, href: "/crew", section: "Navigate" },
  { label: "My shortlist", keywords: ["favourites", "saved", "bookmarks"], icon: <Bookmark size={14} />, href: "/crew/shortlist", section: "Navigate" },
  { label: "My Crew profile", keywords: ["edit", "account"], icon: <UserCircle2 size={14} />, href: "/crew/me", section: "Account", signedInOnly: true },
  { label: "Terms", icon: <FileText size={14} />, href: "/terms", section: "Help" },
  { label: "Privacy", icon: <Scale size={14} />, href: "/privacy", section: "Help" },
  { label: "For rental houses", keywords: ["contact", "listing"], icon: <Mail size={14} />, href: "/listing", section: "Help" },
];

export function CommandPalette() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut. Swallow the key combo so the
  // browser doesn't also trigger its own (Firefox bound it to
  // search on macOS until recently).
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  // Expose an imperative open() so the TopNav button can trigger
  // the palette without re-importing its state. Uses a custom
  // event so the listener lives here.
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("riglogic:open-command-palette", openHandler);
    return () =>
      window.removeEventListener(
        "riglogic:open-command-palette",
        openHandler,
      );
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const visibleActions = ACTIONS.filter(
    (a) => !a.signedInOnly || isSignedIn,
  );
  const sections = Array.from(
    new Set(visibleActions.map((a) => a.section)),
  ) as Action["section"][];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[15%] z-50 w-[90vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command
            label="Global command palette"
            className="w-full"
            // cmdk ships its own filtering; we let it do the work.
          >
            <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
              <Search size={14} className="text-neutral-500" />
              <Command.Input
                placeholder="Search pages… (try 'crew', 'builder', 'privacy')"
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              />
              <kbd className="hidden rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-500 sm:inline">
                esc
              </kbd>
            </div>
            <Command.List className="max-h-[50vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-neutral-500">
                No matches.
              </Command.Empty>
              {sections.map((section) => (
                <Command.Group
                  key={section}
                  heading={section}
                  className="mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-neutral-500"
                >
                  {visibleActions
                    .filter((a) => a.section === section)
                    .map((a) => (
                      <Command.Item
                        key={a.href}
                        value={`${a.label} ${(a.keywords ?? []).join(" ")}`}
                        onSelect={() => go(a.href)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-neutral-100"
                      >
                        <span className="text-neutral-400">{a.icon}</span>
                        {a.label}
                      </Command.Item>
                    ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Small TopNav button that opens the palette. Shows the keyboard
 *  shortcut hint on wider screens so people learn it exists. */
export function CommandPaletteButton() {
  const onClick = () => {
    window.dispatchEvent(new CustomEvent("riglogic:open-command-palette"));
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open command palette (Cmd+K)"
      className="hidden items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition-colors sm:inline-flex"
    >
      <Search size={12} />
      <span>Search</span>
      <kbd className="ml-2 rounded border border-neutral-800 bg-neutral-950 px-1.5 py-0.5 text-[10px] text-neutral-500">
        ⌘K
      </kbd>
    </button>
  );
}
