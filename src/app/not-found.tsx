import Link from "next/link";

export default function NotFound() {
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
          404
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          That link isn&apos;t here.
        </h1>
        <p className="mt-3 max-w-md text-neutral-400">
          The shared kit may have been removed, or the URL might be
          mis-typed.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
        >
          Back to RigLogic
        </Link>
      </main>
    </div>
  );
}
