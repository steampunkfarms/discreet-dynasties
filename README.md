# discreet-dynasties

**TFOS Satellite** — Family legacy and stewardship. Building quiet, enduring wealth across generations.

discreet.tronboll.us is a comprehensive dynasty-building platform: a 28-chapter Living Book with RAG-powered AI companion (4 archetypes + 18 historical/biblical advisors), the FATE household audit model (Food/Assurance/Tools/Energy), 6 guided pathways, AI Armory, community Hall, Stripe-powered subscriptions, gift code system, and the Long Table civic expansion framework.

> **Governance**: All protocols cascade from the [Master Forme](../ft3-tronboll/CLAUDE.md) (`ft3-tronboll/CLAUDE.md`). There is no separate governance.md — `CLAUDE.md` serves that role. Local overrides are forbidden except where explicitly marked "site-specific".

---

## Mission Within TFOS

Discreet Dynasties is the operational expression of Stoic Preparedness — where SP teaches the philosophy, DD provides the household-level implementation. DD is also the **reference implementation** for the full TFOS subscription/commerce stack. Stoic Preparedness was updated to match DD's architecture, and Forging Fathers will be scaffolded directly from DD's codebase.

---

## Core Features

| Feature | Description |
| ------- | ----------- |
| **The Living Book** | 28 chapters across 5 sections (Foundation, FATE Model, Living Preps, Long Table, The Vow) with RAG-powered companion |
| **Dynasty Companion** | 4 archetypes (Steward, Shepherd, Sheepdog, Maker) + 10 historical advisors + 8 biblical advisors + Council Mode (2-advisor dialogue) |
| **FATE Audit** | 4-domain (Food/Assurance/Tools/Energy) x 3-level (Stability/Continuity/Integrity) household readiness assessment |
| **6 Guided Pathways** | FATE Foundation (5w), Living Preps (6w), Gray Man (4w), Energy Independence (8w), Dynasty Wealth (6w), Quiet Mutual Aid (5w) |
| **The Armory** | 15+ AI generators grouped by domain (FATE plans, stability plans, two-family checklists, prep evaluations, energy/water/farm design) |
| **The Hall** | DD-specific community: posts, comments, likes, skill circles, dynasty journals, trusted provider directory, vow wall |
| **The Long Table** | 6-level civic expansion framework (household → two-family → neighborhood → trusted circle → civic → regional) |
| **The Vow** | Formal milestone ceremony after FATE Foundation completion |
| **Gift System** | Redeemable access codes: 1-week, 1-month, 3-months, walking pass (permanent `dd_basic`) |
| **Subscription Tiers** | Builder ($7/mo), Steward ($69/yr), Dynast ($199 lifetime), Forge Bundle ($249 SP+DD) |

---

## Technology Stack

| Layer | Technology | Details |
| ----- | ---------- | ------- |
| Framework | Next.js 14.2 | App Router, standalone output, port 3001 dev |
| Language | TypeScript 5 | Strict mode, path alias `@/*` |
| Database | Neon PostgreSQL | Shared TFOS instance, pgvector for embeddings |
| ORM | Prisma 7.4 | @prisma/adapter-neon + @neondatabase/serverless |
| Auth | NextAuth 5.0-beta | Resend magic link + GitHub OAuth |
| AI — Claude | @anthropic-ai/sdk 0.78 | Dynasty Companion primary model |
| AI — GPT-4o | openai 6.25 | Multi-model forge + embeddings (text-embedding-3-small) |
| AI — Grok | openai 6.25 | api.x.ai, OpenAI-compatible |
| AI SDK | ai 6.0 (Vercel) | Streaming responses |
| Payments | Stripe 20.4 | Subscriptions, checkout, customer portal |
| Email | Resend 6.9 | Magic links, email blasts |
| PDF | @react-pdf/renderer 4.3 | Wizard export |
| Storage | @vercel/blob 2.3 | File/image uploads |
| Icons | lucide-react 0.576 | Consistent icon set |
| Dark Mode | next-themes 0.4 | Light default, class-based toggle |
| Styling | Tailwind CSS 3.4 | Custom dynasty-* design tokens |
| Hosting | Vercel | Auto-deploy from main |

---

## Architecture Overview

```text
                    ┌──────────────────────────────────────┐
                    │        Vercel Edge/Node Runtime       │
                    │       (Next.js App Router SSR)        │
                    └────────┬──────────────────┬──────────┘
                             │                  │
             ┌───────────────▼──┐     ┌─────────▼──────────┐
             │   Public Routes  │     │   Protected/Admin   │
             │  Book, Join,     │     │  Forge, Companion,  │
             │  Home, Auth      │     │  Hall, Admin, Vow   │
             └───────┬──────────┘     └─────────┬──────────┘
                     │                          │
         ┌───────────▼──────────────────────────▼──────────┐
         │               API Layer (/api/*)                │
         │  Auth | Companion | Armory | Stripe | Admin     │
         │  FATE | Pathways | Hall | Vow | Long Table      │
         └──────────────────┬──────────────────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │    Neon PostgreSQL (shared TFOS DB)  │
         │   pgvector for RAG · DD-prefixed     │
         └──────────────────┬──────────────────┘
                            │
   ┌───────┬────────┬───────┼───────┬─────────┬──────────┐
   │       │        │       │       │         │          │
 Users   DDBook   DDFate  DDPath  DDHall    DDVow     DDGift
 Auth    Content  Audit   Progress Posts    LongTable  Codes
 Stripe  Embeddings       Weekly   Comments           Armory
```

**Key Decisions:**

- **DD-prefixed models**: All DD-specific Prisma models are prefixed `DD` to coexist with SP models in the shared database.
- **Shared User table**: Same email = same account across all TFOS sites. `User.role` field gates access.
- **Gift system with auto-downgrade**: `ddAccessExpiresAt` checked in NextAuth session callback. Expired gift users revert to `free`.
- **Four companion archetypes**: Steward (systems), Shepherd (relational), Sheepdog (tactical), Maker (hands-on). Each has distinct personality and advisory style.
- **Council Mode**: Two advisors debate a question from their respective frameworks.
- **FATE scoring**: Strictly level-gated (all L1 must pass before L2 unlocks).
- **Port 3001**: Dev server runs on 3001 to avoid collision with SP (3000).

---

## The FATE Model

The household readiness assessment framework:

```text
           Stability (L1)    Continuity (L2)    Integrity (L3)
           30-day buffer     90-day+ buffer     True independence

  Food     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
           │ Basic supply │   │ Production  │   │ Surplus for │
           │ + rotation   │   │ + preserve  │   │ others      │
           └─────────────┘   └─────────────┘   └─────────────┘

  Assurance┌─────────────┐   ┌─────────────┐   ┌─────────────┐
           │ Emergency    │   │ Insurance + │   │ Multi-gen   │
           │ fund + docs  │   │ legal       │   │ wealth plan │
           └─────────────┘   └─────────────┘   └─────────────┘

  Tools    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
           │ Basic kit +  │   │ Specialized │   │ Teaching +  │
           │ skills       │   │ proficiency │   │ mentoring   │
           └─────────────┘   └─────────────┘   └─────────────┘

  Energy   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
           │ Backup power │   │ Alternative │   │ Off-grid    │
           │ + water      │   │ sources     │   │ capable     │
           └─────────────┘   └─────────────┘   └─────────────┘
```

24 assessment questions (3 levels x 4 domains x 2 questions). Scoring is strict: all L1 questions must pass before L2 is evaluated.

---

## Directory Structure

```text
discreet-dynasties/
├── app/
│   ├── page.tsx                     # Home (hero, 4 paths, FATE overview, companion teaser)
│   ├── layout.tsx                   # Root layout (fonts, providers)
│   ├── book/                        # Living Book (28 chapters, 5 sections)
│   │   └── [slug]/                 # Chapter reader
│   ├── companion/                   # Dynasty Companion AI chat
│   ├── forge/                       # User dashboard
│   ├── assessments/fate/            # FATE Audit tool
│   ├── armory/                      # AI generators
│   │   └── [slug]/                 # Generator detail
│   ├── pathways/                    # 6 guided programs
│   │   └── [slug]/                 # Pathway detail
│   ├── long-table/                  # Civic expansion framework
│   ├── the-vow/                     # Formal milestone
│   ├── hall/                        # Community (posts, comments, likes)
│   │   ├── create/                 # Post composer
│   │   └── [id]/                   # Post detail
│   ├── join/                        # Onboarding / pricing
│   ├── account/                     # Profile + billing
│   ├── forging-fathers/             # FF preview/teaser
│   ├── auth/
│   │   ├── signin/                 # Sign in page
│   │   └── verify/                 # Email verification
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── gifts/                  # Gift code management
│   │   ├── blasts/                 # Email campaign tool
│   │   └── users/[id]/            # User role management
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── companion/              # Companion chat (POST)
│       ├── armory/generate/        # Generator outputs (POST)
│       ├── checkout/               # Stripe checkout (POST → 303)
│       ├── billing/portal/         # Stripe customer portal
│       ├── fate-audit/             # Save FATE audit (POST)
│       ├── pathways/[slug]/complete/ # Mark week complete
│       ├── vow/take/              # Record The Vow
│       ├── long-table/advance/    # Advance Long Table level
│       ├── hall/posts/            # Create/list posts
│       ├── hall/comments/         # Create comment
│       ├── hall/likes/            # Like/unlike
│       ├── gift/[code]/           # Redeem gift code
│       ├── admin/gift/            # Create/send gift codes
│       ├── admin/blast/           # Send email blast
│       ├── admin/users/[id]/      # Update user role
│       ├── account/username/      # Update username
│       ├── webhook/               # Stripe webhook
│       └── health/                # Health check
├── components/
│   ├── Navigation.tsx              # Header + mobile menu
│   ├── Footer.tsx                  # 4-column footer
│   ├── Providers.tsx               # SessionProvider + ThemeProvider
│   └── ThemeToggle.tsx             # Dark mode toggle
├── lib/
│   ├── db.ts                       # Prisma singleton + Neon adapter
│   ├── config.ts                   # Site URLs
│   ├── stripe.ts                   # Tier definitions + pricing + role mapping
│   ├── auth-helpers.ts             # Role helpers + tier labels
│   ├── ai/
│   │   ├── prompts.ts             # 4 archetypes + 10 historical + 8 biblical advisors
│   │   └── rag.ts                 # OpenAI embeddings + pgvector cosine search
│   └── dd/
│       ├── book.ts                # 28 chapters metadata + helpers
│       ├── pathways.ts            # 6 pathways structure + weekly actions
│       └── fate.ts                # FATE model: domains, levels, 24 questions, scoring
├── types/
│   └── next-auth.d.ts              # Session interface extensions
├── prisma/
│   ├── schema.prisma               # 75+ models (shared + DD-prefixed)
│   └── migrations/
├── middleware.ts                    # Route protection (public, auth, paid, admin)
├── auth.ts                         # NextAuth v5 (Resend + GitHub, gift auto-downgrade)
├── next.config.js                  # Standalone output, Vercel Blob images
├── tailwind.config.js              # Dynasty design tokens (amber + walnut)
├── package.json
├── tsconfig.json
├── CLAUDE.md                        # Satellite reference → Master Forme
├── PLAN.md                          # Comprehensive architecture document
├── book.md                          # Book foreword + preface
└── README.md                        # This file
```

---

## Key Files and Their Roles

| File | Purpose |
| ---- | ------- |
| `lib/dd/fate.ts` | FATE model: 4 domains, 3 levels, 24 questions, strict scoring logic |
| `lib/dd/book.ts` | 28 chapters across 5 sections with tier gating (free/builder/steward/dynast) |
| `lib/dd/pathways.ts` | 6 pathways: weekly actions, reflections, tier requirements |
| `lib/ai/prompts.ts` | 4 archetypes + 10 historical advisors + 8 biblical advisors + Council Mode |
| `lib/ai/rag.ts` | pgvector cosine similarity on DDBookContent |
| `lib/stripe.ts` | `PLAN_DETAILS` (single source of truth for pricing), `priceIdToRole()` |
| `auth.ts` | Gift auto-downgrade in session callback (`ddAccessExpiresAt < now` → `free`) |
| `middleware.ts` | Route protection: public, auth-required, paid-only (`paidRoles[]`), admin-only |
| `PLAN.md` | Comprehensive architecture document: site structure, tiers, phases |

---

## Integration Points With Other TFOS Sites

| Integration | Detail |
| ----------- | ------ |
| **Shared Database** | DD models live in the same Neon instance as SP (DD-prefixed). |
| **Shared User Table** | Same email = same account. Roles recognized across sites. |
| **Stripe Customers** | Unified customer via `getOrCreateStripeCustomer()`. |
| **Cross-Site Roles** | `forge_bundle` grants SP + DD access. `full_arsenal` adds FF. |
| **SP Schema Ownership** | SP owns Prisma migrations. DD adds DD-prefixed models. |
| **Design System** | Shared fonts. DD uses amber/walnut accent where SP uses olive/gold. |
| **Build Provenance** | Identical `build-info.ts` pattern. |
| **Forging Fathers Preview** | `/forging-fathers` teaser page for DD users. |

---

## Data Flows

### Companion Chat

```text
User → /companion → Select archetype/advisor
  → POST /api/companion
  → lib/ai/rag.ts: embed query → pgvector cosine search → top 5 DDBookContent chunks
  → lib/ai/prompts.ts: build persona + context
  → Claude API → streaming response
```

### Checkout (Reference Pattern)

```text
User → /join → Select tier
  → POST /api/checkout
  → getOrCreateStripeCustomer(email)
  → stripe.checkout.sessions.create()
  → 303 redirect to Stripe Checkout
  → Stripe webhook → update User.role
```

### FATE Audit

```text
User → /assessments/fate → Answer 24 questions
  → POST /api/fate-audit
  → Score per domain: all L1 pass → L1, all L1+L2 pass → L2, all pass → L3
  → Save DDFateAudit record
```

---

## Dynasty Companion — Advisor System

### Four Archetypes

| Archetype | Voice | Focus |
| --------- | ----- | ----- |
| **Steward** | Methodical, systems-focused | Legacy planning, financial structures, estate management |
| **Shepherd** | Pastoral, relational | Community building, family bonds, mentorship |
| **Sheepdog** | Tactical, direct | Security, readiness, defensive posture |
| **Maker** | Hands-on, craftsman | Self-reliance, building, skeptical of buying solutions |

### Historical Advisors (10)

George Washington, Benjamin Franklin, Cato, Frederick Douglass, Theodore Roosevelt, Cincinnatus, Sun Tzu, Miyamoto Musashi, Marcus Aurelius, Nikola Tesla

### Biblical Advisors (8)

Joseph, Solomon, Abraham, Nehemiah, David, Moses, Daniel, Paul

### Council Mode

Two advisors debate a question from their respective frameworks. The user selects any two from the combined pool.

---

## Subscription Tiers

| Tier | Price | Role | Access |
| ---- | ----- | ---- | ------ |
| Reader | Free | `free` | Free chapters (1-3, 6), home, join |
| Builder | $7/mo | `dd_basic` | Full book, FATE Audit, 3 pathways, Steward companion, Hall |
| Steward | $69/yr | `dd_premium` | Everything + Armory, all pathways, all 4 companions + advisors |
| Dynast | $199 lifetime | `dd_dynast` | Everything + Long Table, The Vow, Council Mode, FF preview |
| Forge Bundle | $249 lifetime | `forge_bundle` | SP + DD full access |

### Gift Codes

| Type | Duration | Role Set |
| ---- | -------- | -------- |
| 1-week | 7 days | `dd_basic` (temporary) |
| 1-month | 30 days | `dd_basic` (temporary) |
| 3-months | 90 days | `dd_basic` (temporary) |
| Walking Pass | Permanent | `dd_basic` (no expiry) |

Gift auto-downgrade: `auth.ts` session callback checks `ddAccessExpiresAt`. Expired → `free`.

---

## Setup and Development

### Prerequisites

- Node.js 18+
- Neon PostgreSQL (shared TFOS instance)
- Stripe account with DD price IDs
- Vercel account

### Local Setup

```bash
git clone <repo-url> && cd discreet-dynasties
npm install
cp .env.example .env.local     # Fill in all secrets
npx prisma generate            # Generate client (SP owns migrations)
npm run dev                    # http://localhost:3001
```

### Scripts

| Script | Command | Purpose |
| ------ | ------- | ------- |
| `dev` | `next dev --port 3001` | Local development (port 3001) |
| `build` | `prisma generate && next build` | Production build |
| `start` | `next start` | Production server |

---

## Environment Variables

### Secrets (all read with `.trim()`)

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Neon Postgres (shared TFOS instance) |
| `NEXTAUTH_SECRET` | NextAuth encryption |
| `NEXTAUTH_URL` | NextAuth callback URL |
| `ANTHROPIC_API_KEY` | Claude API (companion) |
| `OPENAI_API_KEY` | GPT-4o + embeddings |
| `STRIPE_SECRET_KEY` | Stripe server key |
| `STRIPE_PRICE_DD_BUILDER_MONTHLY` | Builder tier price ID |
| `STRIPE_PRICE_DD_STEWARD_ANNUAL` | Steward tier price ID |
| `STRIPE_PRICE_DD_DYNAST_LIFETIME` | Dynast tier price ID |
| `STRIPE_PRICE_FORGE_BUNDLE` | Forge Bundle price ID |
| `RESEND_API_KEY` | Email service |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth |

---

## Deployment

1. Push to `main` branch
2. Vercel auto-builds via `prisma generate && next build`
3. Stripe webhooks route to `/api/webhook`

No manual deployment steps beyond Vercel's defaults.

---

## Governance

This is a satellite of the Tronboll Family of Sites.

- **Master Forme**: [ft3-tronboll/CLAUDE.md](../ft3-tronboll/CLAUDE.md) — single source of truth
- All protocols cascade from the master. Local overrides forbidden except where marked "site-specific".
- **PLAN.md** contains the comprehensive architecture document for DD-specific decisions.
- The [Composing Room](../ft3-tronboll/) in the master repo tracks this site's status.

---

## Claude-Specific Guidance

1. **Read the Master Forme first**: `../ft3-tronboll/CLAUDE.md`
2. **Read PLAN.md**: Contains DD-specific architecture, phases, and domain logic
3. **DD-prefixed models**: All DD Prisma models start with `DD`. Never create unprefixed models in this repo.
4. **SP owns migrations**: Schema changes go through SP's `prisma/schema.prisma`. DD adds DD-prefixed models there.
5. **Checkout pattern**: Server-side 303 redirect to Stripe. This is the correct pattern — SP is being updated to match.
6. **Gift auto-downgrade**: `auth.ts` session callback handles expiry. Test gift flows carefully.
7. **FATE scoring is strict**: L1 must fully pass before L2 evaluates. Don't change scoring logic without understanding cascade effects.
8. **Dynasty design tokens**: `dynasty-*` prefix (amber, walnut). Warmer than SP's forge-* tokens.
9. **ENV VAR safety**: Every secret with `.trim()`. No exceptions.

---

## Roadmap and Status

**Status**: Live — all core features operational.

See `../_suite/ROADMAP.md` and `../ft3-tronboll/docs/roadmap.md` for family-level roadmap.

**Planned**:

- Admin: moderation queue, revenue dashboard, user impersonation
- Full Arsenal tier integration when Forging Fathers launches
- Grandfather clause: existing `dd_dynast` holders get FF access

---

## Cross-Links

| Resource | Location |
| -------- | -------- |
| Master Forme | `../ft3-tronboll/CLAUDE.md` |
| Family Roadmap | `../ft3-tronboll/docs/roadmap.md` |
| Suite Governance | `../_suite/SUITE.md` |
| Subscription Architecture | `../_suite/subscriptions/SUBSCRIPTION_ARCHITECTURE.md` |
| Architecture Plan | `PLAN.md` (this repo) |
| ft3-tronboll | `../ft3-tronboll/` |
| stoic-preparedness | `../stoic-preparedness/` |
| tronboll-us | `../tronboll-us/` |
| TFOS Overview | `../TFOS-overview.md` |

---

## SEO Implementation

| Component | File | Details |
|-----------|------|---------|
| robots.ts | `app/robots.ts` | Allow `/`, disallow `/admin/`, `/api/`, `/forge/`, `/account/`, `/the-foundry` |
| sitemap.ts | `app/sitemap.ts` | Dynamic: home, join, book (28 chapters), pathways (6), armory, hall, the-vow, forging-fathers |
| Root metadata | `app/layout.tsx` | metadataBase, OG image, Twitter card, keywords, canonical |
| JSON-LD (global) | `app/layout.tsx` | Person + WebSite schema on every page |
| JSON-LD (book) | `app/book/[slug]/page.tsx` | Book + BreadcrumbList per chapter, dynamic generateMetadata |
| JSON-LD (pathways) | `app/pathways/[slug]/page.tsx` | Course + BreadcrumbList per pathway, dynamic generateMetadata |
| JSON-LD (armory) | `app/armory/[slug]/page.tsx` | HowTo + BreadcrumbList per generator, dynamic generateMetadata |
| Utility | `lib/json-ld.tsx` | Shared generators (cascaded from master) |

---

Last regenerated: 2026-03-21 · governed by ft3-tronboll/CLAUDE.md
