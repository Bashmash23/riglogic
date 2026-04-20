import Link from "next/link";

// Shared site-wide footer used on the marketing surface (/, /crew,
// /terms, /privacy, /listing). Keeps legal/contact links consistent
// and discoverable on every public page — required for compliance
// and for Google to surface them in indexing.

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-800 px-8 py-6 text-xs text-neutral-500">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <span className="text-center sm:text-left">
          RigLogic · UAE only · English only · Free to use
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/crew" className="hover:text-neutral-300">
            Crew (soon)
          </Link>
          <span className="text-neutral-700">·</span>
          <Link href="/listing" className="hover:text-neutral-300">
            For rental houses
          </Link>
          <span className="text-neutral-700">·</span>
          <Link href="/terms" className="hover:text-neutral-300">
            Terms
          </Link>
          <span className="text-neutral-700">·</span>
          <Link href="/privacy" className="hover:text-neutral-300">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
