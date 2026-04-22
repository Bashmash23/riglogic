"use client";

// Modernised homepage hero — animated gradient, kinetic headline,
// subtle grid overlay. Replaces the plain centred headline.
//
// Everything below the hero stays server-rendered in page.tsx so
// the rest of the landing page still gets SEO-friendly HTML.

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Show, SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

const words = ["UAE productions", "UAE crews", "UAE shoots"];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800">
      {/* Animated gradient backdrop. Two soft accent blobs that
          drift slowly. All GPU-accelerated (transform + opacity)
          so this shouldn't hurt performance. */}
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
      {/* Subtle grid overlay — faint dots. 2px mask so the
          background colour shows through between points. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(255 255 255) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center sm:py-36">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-400 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          UAE · Free to use · Film &amp; video production
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-100 sm:text-7xl"
        >
          The smart gear list for{" "}
          <KineticWord words={words} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-400"
        >
          Build a kit once. Share it with anyone. Rent it anywhere.
          Plus a free directory of UAE freelance crew.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col gap-3 sm:flex-row"
        >
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="group inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-medium text-neutral-950 transition-colors hover:bg-accent-soft">
                Start building
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/builder"
              className="group inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-medium text-neutral-950 transition-colors hover:bg-accent-soft"
            >
              Open the builder
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Show>
          <Link
            href="/crew"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/70 px-6 py-3 text-base text-neutral-200 backdrop-blur transition-colors hover:border-neutral-700"
          >
            Browse crew
          </Link>
        </motion.div>

        <p className="mt-10 text-xs text-neutral-500">
          Indicative rates only. Confirm pricing with rental house.
        </p>
      </div>
    </section>
  );
}

/** Cycles through words with a soft blur cross-fade. The outer
 *  motion.span has `layout` so its width animates to the size of
 *  whichever word is currently visible — that way the full stop
 *  after it sits flush to the word, not floating in the reserved
 *  space of the longest variant. AnimatePresence with mode="wait"
 *  plays the exit animation fully before the enter starts, which
 *  avoids the overlapped-opacity wobble the old timeline had. */
function KineticWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2800);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <motion.span
      layout
      transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
      className="relative inline-flex whitespace-nowrap align-top text-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-block"
        >
          {/* Period is part of the animated span so it blur-fades
              together with the word rather than popping in place
              while the container width animates. */}
          {words[index]}.
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
