// Reusable skeleton placeholder. Single pulsing block; callers
// compose them into the shape of the real content.
//
// We use a CSS animation (built into Tailwind's `animate-pulse`)
// rather than framer-motion so skeletons stay lightweight and
// don't block the main thread on lower-end devices.

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-800/60 ${className}`}
      aria-hidden
    />
  );
}

/** Card-shaped skeleton for the /crew grid while profiles fetch. */
export function CrewCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5 pt-2">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Row of N card skeletons, matching the live grid's column count. */
export function CrewGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CrewCardSkeleton key={i} />
      ))}
    </div>
  );
}
