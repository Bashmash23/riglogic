import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Mail, Pencil, Trash2, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Listing claim & correction — RigLogic",
  description:
    "Rental houses can claim, correct, or remove their listing on RigLogic. Productions can request data deletion or report an error.",
};

// CONTACT_EMAIL: change this to your real receiving address before
// the public launch. Using a personal/Gmail address here is fine for
// day one; swap in support@riglogic.app once that mailbox exists.
const CONTACT_EMAIL = "hello@riglogic.app";

// mailtoFor: builds a `mailto:` link with subject + body pre-filled.
// Encoding handled by encodeURIComponent so quotes/newlines survive.
function mailtoFor(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export default function ListingPage() {
  const claim = mailtoFor(
    "RigLogic — Claim my rental-house listing",
    [
      "Hi RigLogic,",
      "",
      "I operate the rental house listed on your site as: <YOUR HOUSE NAME>",
      "Website: ",
      "Contact name: ",
      "Phone / WhatsApp: ",
      "",
      "I'd like to:",
      "  [ ] Confirm the listing as accurate",
      "  [ ] Add or update gear / pricing",
      "  [ ] Update our specialty description",
      "  [ ] Update the website link",
      "  [ ] Other: ",
      "",
      "Notes:",
      "",
    ].join("\n"),
  );
  const correct = mailtoFor(
    "RigLogic — Correction request",
    [
      "Hi RigLogic,",
      "",
      "I'd like to flag a correction:",
      "",
      "Item / page affected: ",
      "What is wrong: ",
      "What it should say: ",
      "Source / proof (link or attachment): ",
      "",
    ].join("\n"),
  );
  const remove = mailtoFor(
    "RigLogic — Remove my listing",
    [
      "Hi RigLogic,",
      "",
      "Please remove the following from your site:",
      "",
      "House name: ",
      "Items / gear to remove (or 'all'): ",
      "Reason (optional): ",
      "",
      "Confirming I am authorised to make this request on behalf of the rental house.",
      "",
    ].join("\n"),
  );
  const add = mailtoFor(
    "RigLogic — Add our rental house",
    [
      "Hi RigLogic,",
      "",
      "We're a UAE-based rental house and would like to be listed.",
      "",
      "House name: ",
      "Website: ",
      "Specialty / categories: ",
      "Contact name: ",
      "Phone / WhatsApp: ",
      "",
      "Notes / gear catalog link:",
      "",
    ].join("\n"),
  );
  const privacy = mailtoFor(
    "RigLogic — Privacy / data deletion request",
    [
      "Hi RigLogic,",
      "",
      "I'd like to:",
      "  [ ] Delete my account and all associated data",
      "  [ ] Request a copy of my data",
      "  [ ] Other privacy question: ",
      "",
      "Account email: ",
      "",
    ].join("\n"),
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-neutral-200">
        <h1 className="text-3xl font-semibold tracking-tight">
          Listing claim &amp; correction
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300">
          RigLogic is a free directory of UAE rental houses and the gear
          they typically stock. We list publicly available information so
          productions can plan kits faster — but everything below is
          editable. Pick the option that matches your situation.
        </p>

        <div className="mt-10 space-y-4">
          <ActionCard
            icon={<Pencil size={18} />}
            title="I run a rental house listed here"
            description="Confirm your listing, update your gear, fix pricing, or change your specialty description. We'll update within a few days of receiving your message."
            href={claim}
            cta="Email us to claim / update"
          />
          <ActionCard
            icon={<Trash2 size={18} />}
            title="I want my listing removed"
            description="If you'd rather not be listed at all, email us and we'll remove your house and every item linked to it within 7 days. No questions asked."
            href={remove}
            cta="Email us to remove"
          />
          <ActionCard
            icon={<Plus size={18} />}
            title="I run a UAE rental house and want to be added"
            description="Tell us who you are and what you stock. Listings are free and stay free — RigLogic does not charge rental houses, take commissions, or run ads."
            href={add}
            cta="Email us to be added"
          />
          <ActionCard
            icon={<Pencil size={18} />}
            title="I spotted an error in a gear item"
            description="Wrong model name, wrong specs, broken image, or out-of-date pricing. Send us the detail and we'll fix it."
            href={correct}
            cta="Email us a correction"
          />
          <ActionCard
            icon={<Mail size={18} />}
            title="Privacy / account / data request"
            description="Delete your account, request a copy of your data, or ask any other privacy question."
            href={privacy}
            cta="Email us about privacy"
          />
        </div>

        <div className="mt-12 rounded-md border border-neutral-800 bg-neutral-900/40 p-5 text-sm text-neutral-400">
          <p>
            <strong className="text-neutral-200">A note on how we list houses.</strong>{" "}
            We compile listings from publicly visible information on each
            house&rsquo;s own website. We do not scrape live inventory or
            republish private price lists. Indicative day rates shown in
            the builder are reference figures only and must be confirmed
            directly with the rental house. RigLogic is not a booking
            platform and does not transact rentals on anyone&rsquo;s
            behalf.
          </p>
          <p className="mt-3">
            If you&rsquo;d prefer to reach us directly without using the
            form-letter buttons above, email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="text-base font-medium text-neutral-100">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-400">
            {description}
          </p>
          <a
            href={href}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-soft transition-colors"
          >
            <Mail size={12} />
            {cta}
          </a>
        </div>
      </div>
    </div>
  );
}
