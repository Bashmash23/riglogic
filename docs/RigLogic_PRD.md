# RigLogic — Product Requirements Document

**Version:** 1.0
**Region:** UAE
**Status:** Ready for build

---

## 1. What we're building

RigLogic is a web-based gear-list tool for film and video productions in the UAE. A user picks their shoot dates, builds a gear list from a curated regional database, and the **Smart-Match** engine automatically suggests the compatible essentials (tripod heads, lens mounts, power plates, media) for each primary item they add.

For every gear item, RigLogic points the user to a UAE rental house. The final output is a shareable, printable gear list with an indicative cost estimate and the shoot dates embedded.

**Positioning:**
> "The smart gear list for UAE productions. Build it once, send it to anyone, rent it anywhere."

RigLogic is **not** a rental marketplace, an inventory aggregator, or a booking platform. It is a gear-list tool with built-in expertise that points users toward rental houses.

## 2. Who it's for

Designed for anyone who builds a gear list manually today:

- Solo DPs and owner-operators prepping their own shoots
- Production managers at small/mid production companies
- Film students and freelancers doing one-day shoots
- 1st ACs and gaffers building department pulls

**Design bias:** Optimize for the solo DP or small-company PM. Big production houses have internal systems; don't chase them.

## 3. Core features

### Feature 1 — Kit Builder with Shoot Dates

A clean, fast interface for assembling a gear list for a specific shoot.

**Requirements:**
- Optional, skippable calendar for shoot start + end dates; dates editable at any point in the flow.
- Search bar with autocomplete over a curated UAE gear database.
- Browse by category: Cameras, Lenses, Lighting, Grip, Audio, Monitoring, Power, Media, Accessories.
- Each gear item shows: name, image, category, indicative AED day rate, and the mapped UAE rental house.
- Quantity selector, remove, and duplicate actions on every line.
- Persistent "Your kit" panel visible while building (sidebar on desktop, drawer on mobile).
- Live cost estimate: `day rate × quantity × rental days`. If no dates, show per-day total only.
- Persistent disclaimer near totals: *"Indicative rates only. Confirm pricing with rental house."*

### Feature 2 — Smart-Match Compatibility Engine

The core differentiator. When a user adds a primary item (camera body, cinema lens set, key light), RigLogic surfaces the compatible essentials inline.

**Requirements:**
- Categorized suggestions per primary item across: Support, Power, Lens Mount, Media, Monitoring, Handheld Rig.
- Each suggestion has a one-sentence "why" note (e.g., *"Required — LPL-to-PL adapter for using PL-mount lenses on the Alexa Mini LF."*).
- User actions per suggestion: **Add**, **Add all**, **Dismiss**.
- Dismissed suggestions remain retrievable via a "Show suggestions" toggle on the primary item.
- **Day-one authoring scope:** top 8–10 UAE cameras fully mapped (e.g., Alexa Mini LF, Alexa 35, RED V-Raptor, RED Komodo, Sony Venice 2, Sony FX6/FX9, Canon C300 Mk III, Canon C70, BMPCC 6K Pro).
- **Pro tier teaser:** a locked "Deep" panel per primary item showing conditional logic (handheld vs. sticks, shoot duration, interior vs. exterior) behind a "Join Pro waitlist" capture. No payment on day one.

### Feature 3 — Gear List Export & Share

The money moment. A user must be able to walk away with something they can send to a producer or a rental house.

**Requirements — all three outputs available on day one:**

- **Printable PDF.** Header with project name (optional), shoot dates, and user name/email. Body grouped by category with quantities, day rates, and line totals. Footer with kit total, rental house summary, and disclaimer. Filename: `RigLogic_[ProjectName]_[Date].pdf`.
- **Shareable link.** Public URL rendering the kit in a clean read-only view. Works without the recipient creating an account. One-click copy.
- **Pre-filled inquiry email.** Generates a mailto draft per rental house with the user's items for that house, shoot dates, and a polite inquiry line. Example subject: *"Rental inquiry — [Dates] — [N items]"*.
- Each gear item in the export retains its **"Check availability"** link to the mapped UAE rental house (single link per item).

## 4. Out of scope (explicit)

Do not build any of these on day one. Cutting them is what makes the product shippable.

- Real-time rental inventory or availability lookups
- Scraping rental house websites for prices
- In-app booking, payments, or checkout
- Freelancer/crew marketplace, profiles, ratings, availability sync *(visible as a "Crew — Coming soon" nav stub only)*
- User accounts with passwords *(email-link save is an optional stretch only)*
- Multi-language support (English only)
- Multi-city expansion beyond the UAE
- Team accounts, project history, kit templates
- Paid Pro tier with live payments *(teaser + waitlist only)*

## 5. UX direction

**Principles:**
- **Fast and calm.** This is a professional tool. No splashy marketing-site motion inside the app.
- **No login wall.** The core flow completes without signup. Saving a kit is optional.
- **Desktop-optimized, mobile-usable.** Gear lists are built at desks, referenced on set.
- **Empty states matter.** First-time users see 2–3 example items and a "Start with a camera" prompt.
- **Respect industry language.** Users know what a "19mm rod" or "B-mount" is. Don't over-explain in the UI; do explain in Smart-Match reasoning.

**Visual tone:**
- Dark mode default is appropriate for the industry aesthetic.
- Real product photography where possible.
- Generous whitespace; dense enough to show a full kit without scrolling on desktop.
- Smart-Match "why" notes in a muted secondary color — informative, not shouty.

**Key screens:**
1. **Landing** — one-line pitch, "Start building" CTA, 2–3 screenshots.
2. **Date picker** — calendar with a prominent "Skip" option.
3. **Kit builder** — search/browse on the left, live kit on the right, Smart-Match suggestions inline.
4. **Kit review / export** — full kit view, totals, three export actions side-by-side.
5. **Shared kit (read-only)** — clean rendering of a shared link.
6. **Crew (stub)** — "Coming soon" + waitlist email capture.

**Priority order if time runs out:**
Feature 3 (export) > Feature 2 (Smart-Match) > Feature 1 (kit builder basics) > dates > cost estimates. The export moment is what makes users come back; don't sacrifice it to polish the calendar.

## 6. Content requirements (author before build)

The product is only as good as the data. Author all of the following in a spreadsheet **before** touching code:

- Gear database: 60–100 items covering UAE-popular kits.
- Compatibility rules: full Smart-Match mappings for the top 8–10 cameras.
- Rental house directory: 5–8 houses with logo, name, website URL, specialty notes.
- Item-to-shop mapping: one preferred UAE shop per item.
- Indicative AED day rate per item.
- Copy: landing headline, empty states, email templates, PDF header/footer, legal disclaimer.

## 7. Success criteria (first two weeks post-launch)

- **Activation:** users complete a kit with ≥3 items.
- **Output use:** % of completed kits that are exported (PDF, link, or email).
- **Smart-Match engagement:** % of primary-item adds where at least one suggestion is accepted.
- **Qualitative:** 3 real UAE production managers say this saved them time.
