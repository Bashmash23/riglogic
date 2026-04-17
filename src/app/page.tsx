import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Search, Sparkles, FileText, Link as LinkIcon } from "lucide-react";
import { HomeProjects } from "./HomeProjects";

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
          <Link
            href="/crew"
            className="text-neutral-400 hover:text-neutral-100"
          >
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

      {/* Hero */}
      <section className="flex flex-col items-center px-6 py-24 text-center">
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
      </section>

      {/* Projects — signed-in only */}
      <Show when="signed-in">
        <HomeProjects />
      </Show>

      {/* Three-step pitch */}
      <section className="border-t border-neutral-800 bg-neutral-950/50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
            How it works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StepCard
              step={1}
              icon={<Search size={18} />}
              title="Build the kit"
              body="Search or browse a curated UAE gear database. Add cameras, lenses, lights, grip — with AED day rates and a mapped rental house."
            />
            <StepCard
              step={2}
              icon={<Sparkles size={18} />}
              title="Smart-Match the essentials"
              body="Add a camera and RigLogic surfaces the compatible support, power, media, monitoring, and rig — each with a one-line why."
            />
            <StepCard
              step={3}
              icon={<FileText size={18} />}
              title="Export &amp; send"
              body="Download a printable PDF, copy a shareable link, or draft a rental-inquiry email — one click each. No account needed to view."
            />
          </div>
        </div>
      </section>

      {/* Screenshot placeholder strip */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ScreenshotBlock label="Kit builder" tint="from-amber-900/30" />
            <ScreenshotBlock
              label="Smart-Match suggestions"
              tint="from-sky-900/30"
            />
            <ScreenshotBlock label="Shareable kit" tint="from-emerald-900/30" />
          </div>
          <p className="mt-3 text-center text-[11px] text-neutral-600">
            Product preview — real screenshots ship with the public launch.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-neutral-800 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
            Made for
          </h2>
          <p className="mt-3 text-xl text-neutral-200 leading-relaxed">
            Solo DPs prepping their own shoots · Production managers at small
            houses · 1st ACs and gaffers building department pulls · Film
            students who still build gear lists by hand.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-800 px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Stop duct-taping spreadsheets.
        </h2>
        <p className="mt-3 text-neutral-400">
          Your next gear list is three clicks away.
        </p>
        <div className="mt-6">
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
              className="inline-block rounded-md bg-accent px-6 py-3 text-base font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
            >
              Open the builder
            </Link>
          </Show>
        </div>
      </section>

      <footer className="border-t border-neutral-800 px-8 py-6 text-center text-xs text-neutral-500">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <span>RigLogic · UAE only · English only</span>
          <span className="flex items-center gap-3">
            <Link href="/crew" className="hover:text-neutral-300">
              Crew (soon)
            </Link>
            <span className="text-neutral-700">·</span>
            <a
              href="#"
              className="pointer-events-none opacity-50"
              title="Not implemented on day one"
            >
              Privacy
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  body,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </span>
        <span className="text-xs font-semibold text-neutral-500">
          Step {step}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-medium text-neutral-100">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-400">{body}</p>
    </div>
  );
}

function ScreenshotBlock({ label, tint }: { label: string; tint: string }) {
  return (
    <div
      className={`aspect-[4/3] rounded-lg border border-neutral-800 bg-gradient-to-br ${tint} to-neutral-950 flex items-center justify-center`}
    >
      <span className="rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1 text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
        <LinkIcon size={11} />
        {label}
      </span>
    </div>
  );
}
