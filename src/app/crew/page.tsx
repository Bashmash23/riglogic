import Link from "next/link";

export default function CrewPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            Rig<span className="text-accent">Logic</span>
          </span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-400">
          Coming soon
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Crew</h1>
        <p className="mt-4 max-w-md text-neutral-400">
          A marketplace for UAE crew — DPs, ACs, gaffers, sound. Not live yet.
          Waitlist opens with M6.
        </p>
      </main>
    </div>
  );
}
