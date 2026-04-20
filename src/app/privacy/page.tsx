import Link from "next/link";
import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — RigLogic",
  description:
    "Privacy Policy for RigLogic — what data we collect, why, and how to remove it.",
};

const LAST_UPDATED = "20 April 2026";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-neutral-200">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="1. Plain-English summary">
          <p>
            RigLogic stores the absolute minimum needed to run the
            product: your sign-in details (handled by Clerk), the gear
            lists you build (in our database on Railway Postgres), and
            anonymous page-view counts (Vercel Web Analytics). We do not
            sell, trade, or share your data with third parties for
            marketing. We do not use advertising cookies. We do not track
            you across other websites.
          </p>
        </Section>

        <Section title="2. What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account information.</strong> When you sign in, our
              authentication provider Clerk stores your email address,
              name (optional), profile photo (optional), and a unique
              user ID. We do not see or store your password.
            </li>
            <li>
              <strong>Project data.</strong> The project names, dates,
              gear lists, and dismissed Smart-Match suggestions you
              create are stored in our Postgres database, linked to your
              Clerk user ID.
            </li>
            <li>
              <strong>Share links.</strong> If you publish a public
              share link, the kit snapshot is stored and served at the
              short URL until you revoke it.
            </li>
            <li>
              <strong>Waitlist email.</strong> If you join the Crew
              waitlist, your email is stored in our Postgres database
              for the sole purpose of emailing you when the feature
              ships.
            </li>
            <li>
              <strong>Analytics.</strong> Vercel Web Analytics records
              anonymous page views, referrers, and rough country-level
              location. No cookies are set, no individual users are
              tracked, and the data cannot be tied back to your account.
            </li>
            <li>
              <strong>Operational logs.</strong> Vercel and Railway
              record standard server logs (IP address, request URL,
              timestamp, user-agent) for security and debugging. These
              are retained for short periods and not used for marketing.
            </li>
          </ul>
        </Section>

        <Section title="3. What we do not collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>Payment information — RigLogic is free.</li>
            <li>
              Government IDs, passport numbers, or any sensitive
              identification documents.
            </li>
            <li>
              Health, biometric, or location data beyond what your
              browser sends in standard request headers.
            </li>
            <li>
              Advertising profiles or cross-site browsing history.
            </li>
          </ul>
        </Section>

        <Section title="4. Third-party services we use">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Clerk</strong> (clerk.com) — authentication. See{" "}
              <a
                href="https://clerk.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Clerk&rsquo;s privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel</strong> (vercel.com) — hosting and
              analytics. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Vercel&rsquo;s privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Railway</strong> (railway.app) — Postgres
              database hosting. See{" "}
              <a
                href="https://railway.app/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Railway&rsquo;s privacy policy
              </a>
              .
            </li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>
            We do not set marketing or advertising cookies. Clerk sets
            functional cookies that are required for you to stay signed
            in (a session token). Without these you cannot use the
            authenticated parts of the site.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            You can:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Sign in and view all kits and projects associated with your
              account.
            </li>
            <li>
              Delete any project, kit, or share link from inside the
              builder at any time.
            </li>
            <li>
              Request full account deletion (every project, kit, and
              share link wiped, plus the Clerk account closed) by
              contacting us via the{" "}
              <Link href="/listing" className="text-accent hover:underline">
                contact page
              </Link>
              . We will process this within 30 days.
            </li>
          </ul>
        </Section>

        <Section title="7. Data retention">
          <p>
            Project data is retained for as long as your account is
            active. Closed accounts have all associated data deleted
            within 30 days. Server logs are retained for the periods
            specified by Vercel and Railway (typically 30–90 days).
            Anonymous analytics data is retained indefinitely.
          </p>
        </Section>

        <Section title="8. Children">
          <p>
            RigLogic is intended for film and video production
            professionals and is not directed at users under the age of
            18.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this policy at any time. Material changes will
            be reflected by an updated date at the top of this page.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For any privacy question or to request data deletion, see
            the{" "}
            <Link href="/listing" className="text-accent hover:underline">
              contact page
            </Link>
            .
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
