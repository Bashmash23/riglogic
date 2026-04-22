"use client";

// Tiny client wrapper that fades + lifts a child into view on
// mount. Used by the public profile page to soften its load
// (server component can't use framer-motion directly).

import { motion } from "framer-motion";

export function MotionHero({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
