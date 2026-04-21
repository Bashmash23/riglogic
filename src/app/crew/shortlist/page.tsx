// /crew/shortlist — production's saved crew. The shortlist itself
// is stored client-side (localStorage) so this page is a thin
// client component that fetches full profile data for the current
// saved slugs. No auth required; anyone can save and view their
// own list.

import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SmartBackLink } from "@/components/SmartBackLink";
import { ShortlistClient } from "./ShortlistClient";

export const metadata: Metadata = {
  title: "My shortlist — RigLogic Crew",
  description:
    "Saved freelancers from the RigLogic UAE crew directory — your personal shortlist for upcoming shoots.",
  robots: { index: false, follow: false },
};

export default function ShortlistPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <SmartBackLink fallback="/crew" />
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              My shortlist
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Crew you&rsquo;ve saved for upcoming shoots. Lives on this
              device &mdash; it&rsquo;s not published anywhere and no one
              else can see it.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <ShortlistClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
