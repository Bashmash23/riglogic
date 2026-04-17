import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            Rig<span className="text-accent">Logic</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/crew" className="text-neutral-400 hover:text-neutral-100">
            Crew
          </Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-neutral-300 hover:text-neutral-100">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/builder"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
            >
              Open builder
            </Link>
            <UserButton />
          </Show>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-400">
          UAE · For film &amp; video production
        </span>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          The smart gear list for{" "}
          <span className="text-accent">UAE productions</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-neutral-400">
          Build it once, send it to anyone, rent it anywhere. Smart-Match
          automatically suggests the compatible essentials for every camera,
          lens, and light you add.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-md bg-accent px-6 py-3 text-base font-medium text-neutral-950 hover:bg-accent-soft transition-colors">
                Start building
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/builder"
              className="rounded-md bg-accent px-6 py-3 text-base font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
            >
              Open the builder
            </Link>
          </Show>
        </div>
        <p className="mt-8 max-w-md text-xs text-neutral-500">
          Indicative rates only. Confirm pricing with rental house.
        </p>
      </main>

      <footer className="border-t border-neutral-800 px-8 py-4 text-center text-xs text-neutral-500">
        RigLogic · UAE only · English only
      </footer>
    </div>
  );
}
