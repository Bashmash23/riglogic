// /crew — public Behance-style directory of all published
// freelancer profiles. Server-rendered so Googlebot can index the
// names and roles directly.

import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { Plus, Pencil } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listPublishedProfiles } from "@/lib/crewQueries";
import { prisma } from "@/lib/db";
import { CrewCard } from "./components/CrewCard";

export const metadata: Metadata = {
  title: "Crew — RigLogic",
  description:
    "A free directory of UAE freelance film and video crew. DPs, ACs, gaffers, sound, drone pilots, steadicam, HMU, and more.",
};

// Avoid build-time DB calls — render on each request. Cheap (<200ms
// with the current row count) and means new profiles show up
// instantly without waiting for a rebuild.
export const dynamic = "force-dynamic";

export default async function CrewDirectoryPage() {
  const [{ userId }, profiles] = await Promise.all([
    auth(),
    listPublishedProfiles().catch((err) => {
      console.error("Failed to load crew profiles", err);
      return [];
    }),
  ]);

  // If the viewer is signed in, figure out whether they already
  // have a profile — controls whether the CTA says "Create" or
  // "Edit your profile".
  let viewerHasProfile = false;
  if (userId) {
    try {
      const own = await prisma.crewProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      viewerHasProfile = Boolean(own);
    } catch {
      /* ignore — keep the flag false */
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopNav />

      {/* Hero */}
      <section className="border-b border-neutral-800 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <span className="mb-4 inline-block rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs uppercase tracking-wider text-accent">
            UAE crew directory · Free to join
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Film &amp; video crew,{" "}
            <span className="text-accent">one page</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-400">
            DPs, ACs, gaffers, sound, steadicam, drone, HMU, art —
            freelancers based in or available for work in the UAE. Create
            your profile in two minutes and show up here.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {userId ? (
              <Link
                href="/crew/me"
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
              >
                {viewerHasProfile ? <Pencil size={14} /> : <Plus size={14} />}
                {viewerHasProfile ? "Edit your profile" : "Create your profile"}
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft transition-colors">
                  <Plus size={14} />
                  Sign in to create your profile
                </button>
              </SignInButton>
            )}
            <span className="text-xs text-neutral-500">
              {profiles.length}{" "}
              {profiles.length === 1 ? "profile" : "profiles"} listed
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 px-6 py-24 text-center">
            <h2 className="text-lg font-medium text-neutral-200">
              No crew profiles yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-500">
              Be the first. Takes about two minutes — name, roles, a bio,
              a photo, and your portfolio links.
            </p>
            {userId ? (
              <Link
                href="/crew/me"
                className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft"
              >
                <Plus size={14} />
                Create the first profile
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft">
                  <Plus size={14} />
                  Sign in to create
                </button>
              </SignInButton>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <CrewCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
