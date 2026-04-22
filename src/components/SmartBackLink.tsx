"use client";

// LinkedIn-style "back" button. Uses the browser history when it
// has any, which preserves scroll position and — on /crew — the
// URL-backed filter state. Falls back to a safe explicit URL when
// there's no history (user arrived via a direct share / new tab).
//
// Detection: Next.js doesn't expose history length cleanly per
// route, so we track whether the user navigated *within* our app
// via a global boolean flipped on mount. If navigation happened
// entirely inside RigLogic, router.back() works; otherwise we
// fall back.
//
// Optional `onBeforeBack` hook lets the caller (e.g. the profile
// editor) interrupt navigation for an unsaved-changes confirm.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  /** Safe URL to navigate to when there's no in-app history. */
  fallback: string;
  /** Text shown next to the arrow. Default "Back". */
  label?: string;
  /** Called before navigation. Return false (or a Promise
   *  resolving to false) to cancel. Use to show a confirm dialog. */
  onBeforeBack?: () => boolean | Promise<boolean>;
  className?: string;
}

// Track in-app navigation at the module level. Flipped to true by
// the first client-side route change after the user landed.
let hasInAppHistory = false;

function InAppHistoryTracker() {
  useEffect(() => {
    // popstate fires on back/forward. pushstate / replacestate is
    // what Next.js uses internally for Link clicks — we patch them
    // here once.
    const pushFlag = () => {
      hasInAppHistory = true;
    };
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      pushFlag();
      return origPush.apply(this, args);
    };
    history.replaceState = function (...args) {
      pushFlag();
      return origReplace.apply(this, args);
    };
    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);
  return null;
}

export function SmartBackLink({
  fallback,
  label = "Back",
  onBeforeBack,
  className,
}: Props) {
  const router = useRouter();
  // Mirror the module-level flag into React state so the component
  // re-renders the correct href on nav. Also prevents SSR/CSR
  // mismatch — on first render we always show the fallback <Link>,
  // which gracefully handles direct hits.
  const [hasHistory, setHasHistory] = useState(false);
  useEffect(() => {
    setHasHistory(hasInAppHistory);
  }, []);

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      if (onBeforeBack) {
        // preventDefault must run synchronously in the click
        // handler — if we wait for an async confirm() first, the
        // browser has already started navigating by the time the
        // Promise resolves. So we always cancel default here and
        // manually navigate only when the check passes.
        e.preventDefault();
        const ok = await onBeforeBack();
        if (!ok) return;
        if (hasHistory) router.back();
        else router.push(fallback);
        return;
      }
      if (hasHistory) {
        e.preventDefault();
        router.back();
      }
      // Else: the default <Link> navigation to fallback runs.
    },
    [hasHistory, onBeforeBack, router, fallback],
  );

  const base =
    "inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors";

  return (
    <>
      <InAppHistoryTracker />
      <Link
        href={fallback}
        onClick={onClick}
        className={className ?? base}
      >
        <ArrowLeft size={12} />
        {label}
      </Link>
    </>
  );
}
