"use client";

// LinkedIn-style profile completeness widget. Lives at the top of
// the editor, updates live as the user types (no save needed). The
// scoring is intentionally soft: the max isn't 100% from just
// filling text fields — you have to actually upload a photo, a CV,
// and turn on availability for the final 20 points. That way
// "100%" means a genuinely useful profile, not a speed-run through
// blank text boxes.

import { useMemo } from "react";
import { Check, CircleDashed } from "lucide-react";
import type { PortfolioLink, SocialLinks } from "@/lib/crewTypes";

interface Props {
  displayName: string;
  headline: string;
  bio: string;
  city: string;
  roles: string[];
  email: string;
  phone: string;
  portfolioLinks: PortfolioLink[];
  socialLinks: SocialLinks;
  photoUrl: string | null;
  cvUrl: string | null;
  showAvailabilityCalendar: boolean;
}

interface CheckItem {
  label: string;
  met: boolean;
  points: number;
}

export function CompletenessNudge(props: Props) {
  const items: CheckItem[] = useMemo(() => {
    const hasBio = props.bio.trim().length >= 80;
    const hasContact =
      props.email.trim().length > 0 || props.phone.trim().length > 0;
    const hasPortfolio = props.portfolioLinks.filter(
      (l) => l.label.trim() && l.url.trim(),
    ).length;
    const socialCount = Object.values(props.socialLinks).filter(
      (v) => typeof v === "string" && v.trim().length > 0,
    ).length;
    return [
      { label: "Name", met: props.displayName.trim().length > 0, points: 5 },
      { label: "Headline", met: props.headline.trim().length > 0, points: 5 },
      { label: "Pick at least one role", met: props.roles.length > 0, points: 10 },
      { label: "Add a city", met: props.city.trim().length > 0, points: 5 },
      { label: "Write a bio (80+ chars)", met: hasBio, points: 10 },
      { label: "Add contact email or phone", met: hasContact, points: 10 },
      {
        label: "Add 2+ portfolio links",
        met: hasPortfolio >= 2,
        points: 15,
      },
      { label: "Add a social link", met: socialCount >= 1, points: 5 },
      { label: "Upload a profile photo", met: Boolean(props.photoUrl), points: 15 },
      { label: "Upload your CV", met: Boolean(props.cvUrl), points: 10 },
      {
        label: "Show availability calendar",
        met: props.showAvailabilityCalendar,
        points: 10,
      },
    ];
  }, [props]);

  const total = items.reduce((s, i) => s + i.points, 0);
  const earned = items.reduce((s, i) => s + (i.met ? i.points : 0), 0);
  const pct = Math.round((earned / total) * 100);
  const remaining = items.filter((i) => !i.met);

  // Color + message tier based on how far along they are.
  const tone =
    pct >= 100
      ? "emerald"
      : pct >= 60
        ? "accent"
        : "neutral";
  const message =
    pct >= 100
      ? "Profile complete — you're making the most of it."
      : pct >= 80
        ? "Almost there. One or two things left."
        : pct >= 40
          ? "Good start. Keep going."
          : "Just getting started.";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Profile strength
          </div>
          <div className="mt-1 text-sm text-neutral-300">{message}</div>
        </div>
        <div
          className={`text-3xl font-semibold ${
            tone === "emerald"
              ? "text-emerald-400"
              : tone === "accent"
                ? "text-accent"
                : "text-neutral-500"
          }`}
        >
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full transition-[width] duration-500 ${
            tone === "emerald"
              ? "bg-emerald-500"
              : tone === "accent"
                ? "bg-accent"
                : "bg-neutral-600"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Remaining checklist — only items still missing. Done items
          are hidden to keep the widget from bloating; we don't need
          to re-congratulate the user for every textbox they filled. */}
      {remaining.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Still to do
          </div>
          <ul className="mt-2 space-y-1.5">
            {remaining.slice(0, 5).map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-xs text-neutral-400"
              >
                <CircleDashed size={12} className="shrink-0 text-neutral-600" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] text-neutral-600">
                  +{item.points}%
                </span>
              </li>
            ))}
            {remaining.length > 5 && (
              <li className="pt-1 text-[11px] text-neutral-500">
                + {remaining.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}

      {pct >= 100 && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          <Check size={12} />
          All checks passed
        </div>
      )}
    </div>
  );
}
