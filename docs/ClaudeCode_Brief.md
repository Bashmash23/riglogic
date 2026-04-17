# Claude Code — Kickoff Brief: RigLogic

## Your task right now

**Do not write any code yet.** Your first job is to read the product requirements document and produce a build plan.

1. Read `RigLogic_PRD.md` in full.
2. Ask me any clarifying questions before you plan. Flag every ambiguity, missing detail, or decision that isn't in the PRD. I would rather answer 10 questions now than fix 10 things later.
3. Once ambiguities are resolved, produce a **build plan with milestones** (see structure below).
4. Wait for my approval on the plan before writing any code.

## About the builder

I am a **non-engineer**. I have **one day** to ship this. Assume:
- I cannot debug your code. If something breaks, you fix it.
- I will not be reviewing code for quality — I will be clicking through the app.
- Explain decisions in plain English, not in jargon.
- When you need input from me, ask **one clear question at a time**, with options where possible.

## What to produce in the plan

Structure your plan as follows:

### 1. Clarifying questions
List every question you need answered before starting. Group them by topic. Do not proceed until I've answered them.

### 2. Milestones
Break the build into sequential milestones. For each milestone:
- **Name** — e.g., "M1: Static kit builder with mock data"
- **Goal** — what the user can do when this milestone is complete
- **Scope** — what's in, what's explicitly deferred to a later milestone
- **Estimated time** — your honest estimate in hours
- **Demoable output** — what I can click through when it's done

Aim for **5–7 milestones** across the day. Each milestone should leave the app in a working, demoable state. No milestone should be "refactor the backend" — every milestone must produce something I can see.

### 3. Milestone priority
Follow the priority order in the PRD:
**Export (Feature 3) > Smart-Match (Feature 2) > Kit builder basics (Feature 1) > Dates > Cost estimates.**
If we run out of time, we cut from the bottom.

### 4. Data dependencies
Call out exactly what data I need to provide (gear list spreadsheet, compatibility rules, rental house directory, day rates, copy). For each, tell me:
- The format you want it in
- The minimum viable version for day one
- Whether you can scaffold with placeholder data while I author the real version

### 5. Assumptions & risks
List the assumptions you're making and the top 3 risks to shipping today. For each risk, propose a fallback.

### 6. What's explicitly NOT in this plan
Restate what you are deliberately not building, per the "Out of scope" section of the PRD. This is a check that we agree on the boundaries.

## Ground rules for the build (once approved)

- Ship a working app at the end of every milestone. No broken states left overnight.
- If you hit a blocker, stop and ask. Don't burn an hour trying a third approach.
- Use placeholder data aggressively in early milestones. Real data gets loaded late.
- Mobile-usable but desktop-optimized. Don't spend time on mobile polish.
- No login wall. The core flow completes without signup.
- Dark mode default.

## Start now

Read the PRD, then come back with your clarifying questions. Don't plan until I've answered them.
