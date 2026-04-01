# discreet-dynasties — Project Rules

## MASTER FORME REFERENCE

This repository follows the Master Forme at /Users/ericktronboll/Projects/ft3-projects/ft3-tronboll/CLAUDE.md as the single source of truth. All protocols (maintenance, style, keyboard layer, build provenance, QA gate, composing room, ink metrics, security profile, multi-model forge) cascade directly from the master. Local overrides are forbidden except where explicitly marked "site-specific".

## Site-Specific

- Purpose: Family legacy & stewardship — building quiet, enduring wealth across generations.
- Stack: Next.js, Prisma (Neon), NextAuth, Anthropic SDK, Stripe, React-PDF, Vercel Blob.
- See README.md for route structure and site-specific functionality.

## Handoff Sanity Check — MANDATORY

CChat (Strategist) designs from outside the codebase and does not follow execution
protocols. CC (Executor) sees production state and is the last line of defense
before changes hit live systems. **Every CChat handoff is a design, not a law.**

Before implementing any handoff, CC must run a Pre-Edit Sanity Pass:

1. **Data state check:** Query existing DB records, sent invoices, live assignments,
   and any state the handoff assumes or modifies. The handoff describes intent —
   the actual production data may have diverged.
2. **Conflict check:** Validate that the handoff does not contradict existing
   architecture, naming conventions, unique constraints, FK relationships, or
   live data (e.g., already-sent invoices tied to a record the handoff renames).
3. **Reversibility check:** Identify which steps affect already-sent, already-paid,
   or already-deployed records. Flag these for extra scrutiny.

- If clean: proceed with execution as mapped.
- If conflicts found: emit a **Sanity Delta** before proceeding:
  - What the handoff says vs. what production state shows
  - Minimal correction with file/anchor evidence
  - Risk if the handoff were followed as-written
  - Adjusted acceptance criteria (if needed)
  - Present the delta to the operator for approval before executing

### Bounded Deviation Rule

CC may deviate from handoff instructions only when ALL are true:

1. Evidence is file-anchored and reproducible
2. Deviation is minimal and risk-reducing
3. Scope does not expand materially

If scope expands, stop and request human confirmation.
All deviations must be logged as "Sanity Delta Applied" in the completion summary.
