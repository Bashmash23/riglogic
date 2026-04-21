import Link from "next/link";
import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SmartBackLink } from "@/components/SmartBackLink";

export const metadata: Metadata = {
  title: "Terms of Service — RigLogic",
  description:
    "Terms of Service for RigLogic — a free directory and gear-list builder for UAE film productions.",
};

const LAST_UPDATED = "20 April 2026";

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-neutral-200">
        <SmartBackLink fallback="/" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="1. What RigLogic is">
          <p>
            RigLogic is a free, non-commercial web tool that helps UAE film
            and video productions build a rental gear list and discover the
            rental houses that may stock the items. It is operated as a
            personal project, not as a registered UAE commercial entity, and
            does not transact, broker, or take payment for any rentals.
          </p>
        </Section>

        <Section title="2. What we are not">
          <p>
            RigLogic is not a rental house, a booking platform, a payment
            processor, or an agent of any rental house. We do not hold
            inventory, take reservations, confirm availability, or guarantee
            pricing. Every transaction happens directly between you and the
            rental house you choose to contact.
          </p>
        </Section>

        <Section title="3. Pricing and availability">
          <p>
            All AED day rates shown in RigLogic are{" "}
            <strong>indicative reference figures</strong> drawn from
            publicly visible rental-house pricing or estimated industry
            ranges. Rates change frequently, vary by project length, may
            include or exclude VAT depending on the house, and may not
            reflect current promotions. You must confirm pricing,
            availability, insurance requirements, and rental conditions
            directly with the rental house before relying on a number you
            see here.
          </p>
        </Section>

        <Section title="4. Rental house listings">
          <p>
            Rental houses are listed in RigLogic as a directory service.
            Listings include the house name, public website link, and a
            general specialty description. Inclusion is not a partnership,
            endorsement, or commercial relationship. If you operate a UAE
            rental house and want your listing updated, your gear added, or
            your house removed entirely, see the{" "}
            <Link href="/listing" className="text-accent hover:underline">
              Listing claim &amp; correction
            </Link>{" "}
            page.
          </p>
        </Section>

        <Section title="5. Brand and product names">
          <p>
            All trademarks, brand names, model names, and product names
            (including but not limited to ARRI, RED, Sony, Canon, Profoto,
            Aputure, Atomos, Sennheiser, DJI, and others) are the property
            of their respective owners. Their use in RigLogic is purely
            descriptive — to identify the gear that productions commonly
            rent — and does not imply endorsement, sponsorship, or
            affiliation with any brand owner.
          </p>
        </Section>

        <Section title="6. Acceptable use">
          <p>
            You agree to use RigLogic only for legitimate film and video
            production planning. You may not scrape the site at scale,
            re-publish the catalog as your own, attempt to break the
            authentication system, or use the tool to harass any rental
            house or vendor.
          </p>
        </Section>

        <Section title="7. User-generated content">
          <p>
            Project names, kit lists, and any other content you create
            inside RigLogic remain yours. By creating a public share link
            (the &ldquo;/s/&rdquo; URL pattern) you agree that anyone with
            that link can view that single kit. You can revoke a share link
            at any time from the builder.
          </p>
        </Section>

        <Section title="8. No warranty">
          <p>
            RigLogic is provided &ldquo;as is&rdquo; with no warranty of
            any kind. We do not guarantee that listings are complete,
            accurate, current, or appropriate for your specific shoot. We
            do not guarantee uptime. We do not guarantee that any rental
            house listed is available, in business, or willing to rent to
            you. You use the tool at your own risk and your own commercial
            judgment.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by UAE law, RigLogic and its
            operator are not liable for any direct, indirect, incidental,
            consequential, or punitive damages arising from your use of
            the site — including without limitation lost shoots, missed
            rentals, pricing disputes, equipment failures, scheduling
            conflicts, or any decision you make based on information you
            saw here.
          </p>
        </Section>

        <Section title="10. Changes to these terms">
          <p>
            We may update these terms at any time. Material changes will
            be reflected by an updated date at the top of this page.
            Continued use of RigLogic after a change means you accept the
            new terms.
          </p>
        </Section>

        <Section title="11. Governing law">
          <p>
            These terms are governed by the laws of the United Arab
            Emirates. Any dispute arising out of your use of RigLogic
            shall be resolved in the courts of Dubai, UAE.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For takedown requests, listing corrections, or any other
            question about these terms, see the{" "}
            <Link href="/listing" className="text-accent hover:underline">
              Listing claim &amp; correction
            </Link>{" "}
            page.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-300">
        {children}
      </div>
    </section>
  );
}
