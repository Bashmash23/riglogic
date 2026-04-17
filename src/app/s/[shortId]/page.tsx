import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  groupByCategory,
  groupByHouse,
  snapshotTotals,
  type KitSnapshot,
} from "@/lib/kitSnapshot";

export const dynamic = "force-dynamic";

export default async function SharedKitPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  let snapshot: KitSnapshot | null = null;
  let dbError = false;

  try {
    const row = await prisma.shareLink.findUnique({ where: { shortId } });
    if (!row) notFound();
    snapshot = row.payload as unknown as KitSnapshot;
    prisma.shareLink
      .update({ where: { shortId }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});
  } catch (err) {
    console.error("shared-page.read failed", err);
    dbError = true;
  }

  if (dbError || !snapshot) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-semibold">Shared kit unavailable</h1>
          <p className="mt-2 text-sm text-neutral-400">
            We couldn&apos;t load this share link. It may have been removed or
            the database may be temporarily unavailable.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Back to RigLogic
          </Link>
        </div>
      </div>
    );
  }

  const { perDay, days, lineTotal } = snapshotTotals(snapshot);
  const categories = groupByCategory(snapshot);
  const houses = groupByHouse(snapshot);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Rig<span className="text-accent">Logic</span>
        </Link>
        <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-400">
          Shared kit · read-only
        </span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {snapshot.projectName}
        </h1>
        <div className="mt-1 text-sm text-neutral-400">
          {snapshot.startDate && snapshot.endDate
            ? `${snapshot.startDate} → ${snapshot.endDate}`
            : "Dates not set"}
          {snapshot.createdByName
            ? ` · Prepared by ${snapshot.createdByName}`
            : ""}
        </div>

        {categories.length === 0 ? (
          <p className="mt-8 text-neutral-500">No items in this kit.</p>
        ) : (
          <div className="mt-8 space-y-8">
            {categories.map((block) => (
              <section key={block.category}>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  {block.category}
                </h2>
                <ul className="mt-2 divide-y divide-neutral-900 border-y border-neutral-900">
                  {block.items.map((it) => {
                    const lineAmount =
                      days > 0
                        ? it.quantity * it.dayRateAED * days
                        : it.quantity * it.dayRateAED;
                    return (
                      <li
                        key={it.lineId}
                        className="grid grid-cols-12 items-center gap-3 py-3 text-sm"
                      >
                        <div className="col-span-6">
                          <div className="font-medium text-neutral-100">
                            {it.name}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {it.blurb}
                          </div>
                        </div>
                        <div className="col-span-3 text-xs text-neutral-400">
                          {it.house ? (
                            <a
                              href={it.house.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-neutral-100"
                            >
                              {it.house.name} · Check availability ↗
                            </a>
                          ) : (
                            "—"
                          )}
                        </div>
                        <div className="col-span-1 text-right tabular-nums">
                          × {it.quantity}
                        </div>
                        <div className="col-span-2 text-right text-neutral-300 tabular-nums">
                          AED {lineAmount.toLocaleString()}
                          {days > 0 && (
                            <div className="text-[10px] text-neutral-500">
                              {it.quantity} × AED{" "}
                              {it.dayRateAED.toLocaleString()} × {days}d
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-neutral-800 pt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-neutral-400">Per-day total</span>
            <span className="text-lg font-semibold">
              AED {perDay.toLocaleString()}
            </span>
          </div>
          {days > 0 && (
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-neutral-200">Kit total · {days} days</span>
              <span className="text-2xl font-semibold">
                AED {lineTotal.toLocaleString()}
              </span>
            </div>
          )}
          <p className="mt-4 text-xs text-neutral-500">
            Indicative rates only. Confirm pricing with rental house.
          </p>
        </div>

        <div className="mt-10">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Rental houses
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {houses.map((h) => (
              <li key={h.houseId ?? h.houseName} className="text-neutral-300">
                {h.houseName} — {h.items.length} item
                {h.items.length === 1 ? "" : "s"}
                {h.houseWebsite && (
                  <a
                    href={h.houseWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-accent hover:underline"
                  >
                    Visit site ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="border-t border-neutral-800 px-6 py-4 text-center text-xs text-neutral-500">
        Shared from RigLogic ·{" "}
        <Link href="/" className="hover:text-neutral-300">
          Build your own
        </Link>
      </footer>
    </div>
  );
}
