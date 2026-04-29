"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { UserCircle2 } from "lucide-react";
import { ShortlistNavLink } from "./ShortlistNavLink";
import { CommandPaletteButton } from "./CommandPalette";
import { Button } from "./ui/Button";

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
    match: (p) => p === "/crew" || p.startsWith("/crew/"),
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
        {/* Cmd+K palette trigger — hidden on mobile (keyboard
            shortcut is the primary path on desktop anyway). */}
        <CommandPaletteButton />
        {/* Shortlist access shown to everyone — signed in or not —
            because the shortlist lives in localStorage. Self-hides
            when the list is empty. */}
        <ShortlistNavLink />
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          {/* Quick shortcut to the Crew profile editor — shown
              alongside the builder CTA so freelancers always have
              a one-click path back to "edit my profile". The
              UserButton dropdown below also has a custom menu item
              for the same destination. */}
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<UserCircle2 size={14} />}
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/crew/me">My profile</Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/builder">Open builder</Link>
          </Button>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="My Crew profile"
                labelIcon={<UserCircle2 size={14} />}
                href="/crew/me"
              />
            </UserButton.MenuItems>
          </UserButton>
        </Show>
      </div>
    </header>
  );
}
