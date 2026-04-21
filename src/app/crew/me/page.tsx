// /crew/me — authenticated profile editor. Server component fetches
// the user's existing profile (or returns null for first-time
// visitors) and hands it off to the client-side form component.

import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { getOwnProfile } from "@/lib/crewQueries";
import { CrewProfileEditor } from "./CrewProfileEditor";

export const metadata: Metadata = {
  title: "Your Crew profile — RigLogic",
  description:
    "Create or edit your RigLogic Crew profile. Add your roles, bio, photo, portfolio links, and CV.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CrewEditorPage() {
  const { userId } = await auth();
  // Middleware should already have redirected, but double-check.
  if (!userId) {
    return (
      <div className="flex flex-1 flex-col">
        <TopNav />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Please sign in</h1>
          <p className="mt-3 text-sm text-neutral-400">
            You need a Clerk account to create or edit a Crew profile.
          </p>
          <Link
            href="/"
            className="mt-6 text-sm text-accent hover:underline"
          >
            ← Back to home
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const existing = await getOwnProfile(userId);

  return (
    <div className="flex flex-1 flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">
            {existing ? "Edit your profile" : "Create your profile"}
          </h1>
          {existing && (
            <Link
              href={`/crew/${existing.slug}`}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              View public page →
            </Link>
          )}
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          Everything below is public on your {" "}
          <Link href="/crew" className="text-accent hover:underline">
            /crew
          </Link>{" "}
          listing. Only you can edit it. You can unpublish or delete
          any time.
        </p>

        <div className="mt-8">
          <CrewProfileEditor initial={existing} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
