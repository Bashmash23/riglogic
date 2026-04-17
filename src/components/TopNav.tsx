"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

// Shared app-wide nav. Used on /, /builder, /crew so a user can always
// jump anywhere in one click. "Projects" is an anchor on the home page —
// signed-out visitors hit it and see the hero/empty state; signed-in ones
// land on their list of projects.
const tabs: Array<{
  label: string;
  href: string;
  match: (pathname: string) => boolean;
  badge?: string;
}> = [
  { label: "Home", href: "/", match: (p) => p === "/" },
  {
    label: "Projects",
    href: "/#projects",
    // Projects is an anchor, never the "active" route on its own.
    match: () => false,
  },
  {
    label: "Crew",
    href: "/crew",
    match: (p) => p.startsWith("/crew"),
    badge: "Soon",
  },
];

export function TopNav() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Rig<span className="text-accent">Logic</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-neutral-800 text-neutral-100"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="text-sm text-neutral-300 hover:text-neutral-100">
              Sign in
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/builder"
            className="hidden rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-accent-soft transition-colors sm:inline-block"
          >
            Open builder
          </Link>
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
