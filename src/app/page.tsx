import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { Search, Sparkles, FileText, Link as LinkIcon } from "lucide-react";
import { HomeProjects } from "./HomeProjects";
import { HomeHero } from "./HomeHero";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <TopNav />

      {/* Modernised hero — animated gradient backdrop, kinetic
          headline, primary + secondary CTAs. Lives in HomeHero
          (client) so everything below can stay server-rendered. */}
      <HomeHero />

      {/* Projects — signed-in only */}
      <Show when="signed-in">
        <HomeProjects />
      </Show>

      {/* Three-step pitch */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950/50 px-6 py-16"
      >
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

      {/* Styled photography strip — film-production visuals from
          Unsplash with a dark gradient overlay so the labels stay
          legible and the tones stay on-brand. Swap any `src` for
          your own URL whenever you have better photography. */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ScreenshotBlock
              label="Kit builder"
              tint="from-amber-900/60"
              src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80"
              alt="Camera gear laid out on a studio bench"
            />
            <ScreenshotBlock
              label="Smart-Match suggestions"
              tint="from-sky-900/60"
              src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80"
              alt="Director of photography behind a cinema camera"
            />
            <ScreenshotBlock
              label="Shareable kit"
              tint="from-emerald-900/60"
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80"
              alt="Film crew collaborating on set"
            />
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

      <SiteFooter />
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

function ScreenshotBlock({
  label,
  tint,
  src,
  alt,
}: {
  label: string;
  tint: string;
  src?: string;
  alt?: string;
}) {
  return (
    <div
      className={`group relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-800 bg-gradient-to-br ${tint} to-neutral-950`}
    >
      {src && (
        // Raw <img> because we're hotlinking external Unsplash URLs
        // and don't want to route them through next/image's remote-
        // pattern allowlist. loading="lazy" keeps the initial
        // paint fast.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
      )}
      {/* Gradient overlay darkens the bottom third so the label
          pill reads cleanly regardless of the photo underneath. */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
      <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1 text-[11px] uppercase tracking-wider text-neutral-300 backdrop-blur">
        <LinkIcon size={11} />
        {label}
      </span>
    </div>
  );
}
