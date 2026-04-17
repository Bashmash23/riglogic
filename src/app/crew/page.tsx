import { CrewWaitlistForm } from "./CrewWaitlistForm";
import { TopNav } from "@/components/TopNav";

export default function CrewPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopNav />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs uppercase tracking-wider text-accent">
          Coming soon
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">Crew</h1>
        <p className="mt-4 max-w-md text-neutral-400">
          A UAE crew marketplace — DPs, ACs, gaffers, sound, makeup, art.
          One place to see availability and rates. We&apos;re building the
          gear-list side first.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Drop your email to hear when crew goes live.
        </p>

        <div className="mt-8 w-full max-w-sm">
          <CrewWaitlistForm />
        </div>
      </main>

      <footer className="border-t border-neutral-800 px-8 py-4 text-center text-xs text-neutral-500">
        RigLogic · UAE only · English only
      </footer>
    </div>
  );
}
