"use client";

// Modernised homepage hero matching the user's mockup. Split
// layout: oversized italic-serif headline on the left, supporting
// copy + dual CTAs on the right (sm: stacks). Animated gradient
// blobs + subtle dot grid in the background. Kinetic word
// rotation has been removed per design — the headline is now a
// single static italic-serif line, magazine-cover style.

import Link from "next/link";
import { motion } from "framer-motion";
import { Show, SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800">
      {/* Animated gradient backdrop. Two soft persimmon/indigo
          blobs that drift slowly. transform + opacity only =
          GPU-accelerated. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-[-20%] h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Faint dot grid for texture. 24px pitch, 4% opacity so
          it's almost subliminal at viewport scale. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(255 255 255) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
        {/* Eyebrow: BETA pill + thin context line. The line ties
            the brand-mark BETA badge into the hero so the two
            don't compete. */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border-30)] bg-[var(--accent-tint-10)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Beta
          </span>
          <span className="text-xs text-neutral-500">
            <span className="text-accent">·</span> Free during beta
          </span>
          <span className="hidden h-px flex-1 bg-neutral-800 sm:block" />
          <span className="hidden text-[11px] uppercase tracking-wider text-neutral-600 sm:inline">
            For UAE film &amp; video crews
          </span>
        </motion.div>

        {/* Split layout. lg+: 7/5 columns. Headline left, copy+CTAs
            right. Stack on mobile. */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight text-neutral-100 sm:text-7xl">
              The smart
              <br />
              gear list for
              <br />
              <span className="font-display text-accent italic">
                UAE productions.
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col gap-6 lg:col-span-5 lg:pt-6"
          >
            <p className="text-base leading-relaxed text-neutral-400 sm:text-lg">
              Build a kit once. Share it with anyone. Rent it
              anywhere. RigLogic surfaces compatible support, power
              and media for every camera you add — so nothing on set
              goes missing.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button
                    variant="primary"
                    size="lg"
                    trailingIcon={<ArrowRight size={16} />}
                  >
                    Start building
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Button
                  variant="primary"
                  size="lg"
                  trailingIcon={<ArrowRight size={16} />}
                  asChild
                >
                  <Link href="/builder">Open the builder</Link>
                </Button>
              </Show>
              <Button variant="secondary" size="lg" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <p className="text-xs text-neutral-500">
              Indicative rates only. Confirm pricing with rental house.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
