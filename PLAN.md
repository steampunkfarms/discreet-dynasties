# Discreet Dynasties — Site Architecture Plan
## discreet.tronboll.us

_Draft for review — F. Tronboll III & Claude_

---

## The Big Picture

**Stoic Preparedness** is the philosophical foundation — *why* we prepare, the ethics of readiness.  
**Discreet Dynasties** is the operational expression — *how* a household becomes a dynasty, system by system, generation by generation.

The two sites form an ecosystem. SP readers graduate into DD. DD links back to SP for philosophical grounding. One account. One community. Two layers of depth.

---

## Positioning & Tone

> "You read Stoic Preparedness to understand *why*. You build Discreet Dynasties to execute *how*."

The site is not a prepper forum or a homesteader blog. It's a **structured implementation platform** for men and households serious about multi-generational thinking. Dense, serious, useful. The voice is the book's: paternal without being condescending, practical without being reductive, grounded in virtue rather than fear.

---

## Domain & Branding

- **URL:** `discreet.tronboll.us`
- **Site name:** The Discreet Dynasty
- **Tagline:** "Build What Lasts."
- **Aesthetic:** Companion to the Forge — darker, more layered. Same forge metals + earthy greens, but deeper charcoals and warmer browns. `--color-dynasty` (deep walnut), `--color-hearth` (warm amber). Feels like a private library adjoining the forge, not a separate brand.

---

## The Stack (mirrors stoic.tronboll.us)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (App Router) | Copy patterns wholesale from SP |
| Database | Prisma v7 + Neon (pgvector) | Separate schema namespace, or shared Neon project |
| Auth | Auth.js v5 | **Shared accounts** — one login works on both sites |
| AI | Claude + OpenAI embeddings | DD book RAG, new companion character |
| Email | Resend | Same account, new templates |
| Payments | Stripe | New products/tiers (SP+DD bundle) |
| Hosting | Vercel | New project, subdomain routing |
| Design | Tailwind + same token system | Extend, don't replace |

---

## Cross-Site Integration

This is critical. The sites must feel like **one ecosystem**, not two independent products.

### Shared Infrastructure
- **Single Auth** — same account/password/magic link works on both sites
- **Shared Stripe** — SP tiers can include DD access (bundle pricing)
- **Shared Hearth** — Community forum is one space; DD-specific categories added
- **Cross-linked navigation** — each site has a subtle "also part of The Forge" link to the other

### Progression Funnels
- SP book Chapter 1 calls out DD explicitly: "The next book in this series..."
- SP `/forge` dashboard shows a "Ready for the Dynasty?" card after users hit milestones
- SP badge: `Dynasty Builder` unlocks when user registers on DD with same account
- DD `/book` Chapter 2 links to SP as "the philosophical foundation" with a contextual invite

### Shared Data Points
- Practice completions from SP visible in DD account ("You've completed 8 of 15 SP weeks")
- DD FATE Audit results feed back into SP companion context
- Weekly Cadence in DD is designed to absorb SP's Four-Virtue Practice

---

## Site Structure

### Primary Navigation
```
The Book          → 28-chapter RAG-enabled living book
The Forge *       → Dashboard / household command center  
Pathways          → 6 guided multi-week programs
The Armory        → 15+ AI-powered generators & tools
Assessments       → The FATE Audit + evaluator tools
The Dynasty Web   → Community + network mapping
Account           → Profile, tiers, cross-site settings
```
_* "The Forge" on DD = "The Yard" was considered, keeping The Forge for brand continuity_

---

## The Book (`/book`)

Same Living Book pattern as SP — identical UX, adapted for 28 chapters.

**28 Chapters across 9 Parts:**
- Part I: The Philosophy (Ch 1-4)
- Part II: The Dynasty (Ch 5-8)
- Part III: Living Preps (Ch 9-11)
- Part IV: Energy & Shelter (Ch 12-14)
- Part V: Food & Water (Ch 15-17)
- Part VI: Health, Security & Skills (Ch 18-20)
- Part VII: Communications & Intelligence (Ch 21-22)
- Part VIII: The Dynasty's Economy (Ch 23-25)
- Part IX: Community & The Long Game (Ch 26-28)
- Appendices A-H (reference tools)

**Book-specific features:**
- Chapter-level RAG (same as SP — 256-token chunks, pgvector search)
- **Inline FATE Audit triggers** — at end of relevant chapters, a "Begin your FATE Audit for this domain" CTA appears
- **Chapter→Tool links** — each chapter that has an associated tool/pathway shows a "Work this chapter" CTA inline
- **Dynasty Companion** integrated per-chapter (see below)
- Progress tracking, same milestone system as SP (with Epub milestone equivalent)

---

## The Dynasty Companion (`/companion`)

DD's companion goes further than SP's. SP was the proving ground. DD is the standard.

### The Four Archetypes (always available)
| Handle | Character | Specialty |
|--------|-----------|-----------|
| The Steward | Long-range, methodical, trust-building | Dynasty structure, legacy, wealth, Long Table |
| The Shepherd | Warm, generational, relational | Parenting, community, mutual aid, faith integration |
| The Sheepdog | Direct, tactical, security-minded | Defense, security, preparedness systems, martial readiness |
| The Maker | Hands-on, technical, practical | Energy, water, food systems, fabrication, cubic inch farming |

### Historical Advisors (selectable by subscription tier)
Users choose advisors from a curated roster. Each is grounded in their documented writings, speeches, and known philosophy — DD doctrine is woven in as the modern application of timeless principles.

**Steward track:**
- **George Washington** — farmer, general, statesman; the Warrior in the Garden made real; returned to Mount Vernon rather than claim a crown; the original discreet dynasty-builder
- **Benjamin Franklin** — self-made systems thinker, inventor, civic architect; income ecosystem before the term existed
- **Cato the Elder** — Roman senator, farmer, builder; "An orator is a good man who speaks well"

**Shepherd track:**
- **Frederick Douglass** — self-made against every conceivable obstacle; the generational stakes of building something that cannot be taken
- **Theodore Roosevelt** — rancher, soldier, conservationist, statesman; the Strenuous Life as preparedness doctrine
- **Cincinnatus** — called from his farm to lead Rome, completed the work, returned to his plow; the highest expression of the Warrior in the Garden

**Sheepdog track:**
- **Sun Tzu** — strategy, economy of force, knowing the terrain before entering it
- **Miyamoto Musashi** — martial mastery as philosophy; *The Book of Five Rings* as doctrine for the prepared man
- **Marcus Aurelius** — (shared with SP) Stoic command under pressure; relevant here through the Sheepdog lens

**Maker track:**
- **Nikola Tesla** — systems thinking, energy independence, the long view on infrastructure
- **Henry David Thoreau** — Walden as the original living preps experiment; self-sufficiency without romanticism

### Biblical Advisors (selectable, faith-integrated tier)
These are not decorative. For a significant portion of the DD audience — men raised in serious faith traditions, men whose stewardship ethic is rooted in covenant — these are the most powerful advisors available. The site does not impose faith, but it does not minimize it either.

| Figure | Archetype | Why |
|--------|-----------|-----|
| **Joseph** | Steward | The Joseph Principle: store in abundance against scarcity; dynastic patience across decades of adversity |
| **Solomon** | Steward | Dynasty wealth, wisdom structures, the long horizon of a kingdom |
| **Abraham** | Steward | Covenant patriarch; multigenerational promise; left everything to build something that would outlast him |
| **Nehemiah** | Sheepdog/Maker | Builder and defender simultaneously; rebuilt the wall with a trowel in one hand and a sword in the other |
| **David** | Shepherd/Sheepdog | Shepherd who became a warrior who became a king; every archetype in one life |
| **Moses** | Shepherd | Leadership, provision, building a people who had forgotten how to be free |
| **Daniel** | Steward | Integrity under capture; thriving inside a hostile system without compromising character |
| **Paul** | Shepherd | Stoic-influenced theology; letters of practical wisdom for communities under pressure |

**Implementation note:** Biblical advisors are not sanitized or made artificially "relevant." They speak in their voice, from their context, engaging the DD framework as a contemporary expression of ancient principle. "What would Solomon say about dynasty trust structures?" is a genuinely interesting question and deserves a genuinely thoughtful answer.

### Companion Capabilities (beyond SP)
- Full 28-chapter RAG + 8 appendices
- FATE Audit awareness (knows your household's current domain scores)
- Pathway awareness (knows which program you're in and what week)
- Long Table awareness (knows your current level and active relationships)
- **Scenario Simulator** — "Run me through a 72-hour grid-down scenario for my household" → personalized stress test using your actual audit data
- **"What's my next action?"** — reads FATE audit + current pathway → single prioritized next step
- **Historical/Biblical advisor mode** — pick any advisor for a focused conversation; they have full DD context
- **Council mode** — bring two advisors into the same conversation (e.g., Washington + Joseph on dynastic wealth; Nehemiah + Musashi on the Sheepdog role)

### On the Author's Preparedness Foundation
The companion's depth is informed by a specific worldview: preparedness is not reactive fear but the practiced expression of virtue. The site's author was shaped by militant Pentecostal discipline, wilderness and mountain survival training, medical corpsman preparation, 17 years of competitive martial arts (kung fu and bare-knuckle), and military-structured tactical training from childhood. That formation — physical, spiritual, tactical, relational — is the soil this book grew from. The companion reflects that. It does not speak to anxious men collecting gear. It speaks to serious men building character and capability over a lifetime.

---

## Guided Pathways (`/pathways`)

Six structured programs, each tied to book chapters. Same UX as SP's 15-week practice but:
- Variable length (6–16 weeks each)
- Tool-gated milestones (some weeks require completing an assessment before advancing)
- Can run multiple pathways simultaneously (by design)

| Pathway | Length | Core Chapters | Entry Requirement |
|---------|--------|---------------|-------------------|
| **FATE Foundation** | 8 weeks | Ch 9-10 + Appendix A | FATE Audit completion |
| **Living Preps Conversion** | 12 weeks | Ch 10-17 | FATE Foundation Week 4 |
| **The Gray Man Path** | 6 weeks | Ch 11 | None (standalone) |
| **Energy Independence** | 16 weeks | Ch 12-14 | FATE Foundation complete |
| **Dynasty Wealth** | 8 weeks | Ch 23-25 | FATE Foundation complete |
| **Quiet Mutual Aid** | 8 weeks | Ch 26-28 | None (community-focused) |

Each week: 1 reading reflection, 1 tool/assessment to complete, 1 action item, 1 journal prompt.

---

## The Armory — AI Generators (`/armory`)

15+ generators. Grouped by domain. Same card-grid UI as SP.

### FATE Domain Generators
1. **FATE Action Plan** — From your audit scores, generates a prioritized 90-day action plan
2. **Household Stability Plan** — Generates your one-page trigger-based plan (printable PDF)
3. **Two-Family Standard Checklist** — Custom checklist scaled to your household + neighbor sizes

### Living Preps Generators  
4. **Resource Flow Map** — Describe your property/setup, get a text-based cascade/loop/stack map
5. **Dead-to-Living Conversion Plan** — Describe a current prep, get conversion steps to make it living
6. **Living Pantry Rotation Schedule** — Based on household size + diet, generates FIFO schedule

### Systems Generators
7. **Energy Architecture Plan** — Input your situation, get Resilience/Redundancy/Sustainability column recommendations
8. **Water System Design** — Property + climate inputs → tiered water system plan
9. **Cubic Inch Farming Layout** — Indoor/outdoor space → yield-optimized farming configuration
10. **Kitchen Preservation Sequence** — What to learn/buy first, in order

### Dynasty & Wealth Generators
11. **Dynasty Trust Primer** — Generates a plain-language explanation of trust structures relevant to your situation + questions to ask your attorney
12. **Income Ecosystem Blueprint** — From your Living Preps, identify monetizable outputs and map income streams
13. **Dynasty Web Map** — Trusted provider categories + gap identification + succession notes

### Community Generators
14. **Quiet Mutual Aid Framework** — For your neighborhood context, generates vulnerability map + giving threshold framework
15. **HAM Radio Progression Plan** — Starting point + licensing path + equipment sequence + local net finding

### Scenarios (like SP's Hunger Test)
16. **72-Hour Grid-Down Scenario** — Full household stress test based on FATE audit data
17. **Long Winter Scenario** — 30-day disruption scenario with resource draw-down modeling
18. **Medical Event Scenario** — Primary earner out, medical emergency, generates gap analysis

---

## Assessments (`/assessments`)

The cornerstone interactive tools. These are more structured than the generators — they take real input and produce scored, trackable output.

### 1. The FATE Audit (primary)
**URL:** `/assessments/fate`

The most important tool on the site. Multi-step form:
- Step 1: Household profile (size, property type, location climate zone)
- Step 2: Food domain (three-tier pantry status, production capacity, preservation skills)
- Step 3: Assurance domain (water sources, health independence, financial resilience, legal structures)
- Step 4: Tools & Skills domain (physical tools, irreplaceable skills inventory)
- Step 5: Energy domain (grid dependency, backup systems, renewable capacity)

Output:
- Score per domain at each level (Stability / Continuity / Integrity)
- Visual radar chart (4 domains × 3 levels)
- Top 3 priority gaps
- AI-generated 90-day action plan (feeds into Armory FATE Action Plan generator)
- Saves to account — retakeable every 6 months, shows progress delta

### 2. Dead / Zombie / Living Prep Evaluator
**URL:** `/assessments/prep-evaluator`

User describes a specific prep (food storage setup, generator, water tank, skill, etc.)  
Tool classifies it as Dead / Zombie / Living with explanation  
Generates conversion path to make it Living if it isn't  
Can log evaluations for a full household audit over time  
Companion integration: "Ask the Sheepdog to evaluate my generator setup"

### 3. Gray Man Self-Audit
**URL:** `/assessments/gray-man`

Four-domain privacy/discretion assessment:
- Appearance & Behavior
- Property & Legal (publicly searchable info, title naming)
- Digital & Social Media (data broker exposure, search visibility)
- Financial (visible wealth signals)

Each domain scored. Remediation checklist generated by priority (ease × impact matrix).  
Annual re-audit tracking.

### 4. Household Stability Plan Builder
**URL:** `/assessments/stability-plan`

Guided form through five trigger categories:
- Hunger trigger → response plan
- Water trigger → response plan
- Cold/Heat/Power trigger → response plan
- Medical trigger → response plan
- Cash Freeze trigger → response plan

Plus Giving Threshold section.  
**Output: Printable one-page PDF** (same print treatment as Armory outputs in SP)  
Annual reminder email.

### 5. Dynasty Web Mapper
**URL:** `/assessments/dynasty-web`

Map your trusted provider network:
- Attorney, CPA, Doctor, Mechanic, Contractor, Farmer, etc.
- For each: trusted (Y/N), succession identified (Y/N), knows your situation (Y/N)
- Gap identification
- Generates "conversations to have" list for gaps
- Succession planning checklist

---

## The Dynasty Web — Community (`/web`)

SP has **The Hearth** (warm, family fire, community warmth). DD gets a different space that carries the weight of what's being built here.

**Community name: The Hall**
The great hall — where dynasties deliberate, where trust is earned, where the long game is discussed. It implies gathering, earned entry, and generational seriousness without being cold or exclusive. Members of The Hall are Builders, Stewards, and Dynasts.

**The Hearth** (SP): philosophy, practice, general community  
**The Hall** (DD): implementation, systems, tools-in-use, dynasty-building discussions

The two communities are separate but cross-linked — SP posts that touch on DD themes can reference The Hall, and vice versa.

### The Hall Features (beyond SP's Hearth)
- **Skill Circles**: Self-organized groups around specific domains (RMH builders, HAM operators, water systems, cubic inch farming, trust/IBC, etc.)
- **Dynasty Journals**: Optional semi-public progress logs — FATE scores over time, pathway completions, prep evaluations. The man who's been at this for 3 years is visible to the man just starting.
- **The Trusted List**: Community-sourced directory of vetted providers by region and specialty (estate attorney, CPA, solar installer, water systems, etc.) — not a marketplace, a curated directory. Entries can be vouched for by multiple members.
- **Gray Man Mode**: Account setting to reduce public profile visibility on community features — pseudonym support, hide location, limit what's visible on Dynasty Journals.
- **The Vow Wall**: Public display of members who have taken The Vow (after completing FATE Foundation). No names required — just a count and optional first name + state. Quiet, visible, powerful.

---

## Account & Tiers (`/account`)

### Pricing Philosophy
Free content earns trust. Tools earn commitment. Community earns loyalty. The strip-and-cancel crowd won't build dynasties anyway — they're not the target. Don't artificially gate content; gate depth and ongoing features. The Lifetime tier is the real anti-churn play: the man who thinks in decades will happily pay $199 once and never look back.

The free tier gives away the *why* (Part I — the philosophy, 4 chapters). The paid tiers deliver the *how* (tools, pathways, community, companion depth). Never tease in a way that feels like bait; the free content should be genuinely useful to a person who only reads Part I.

### Tier Structure
| Tier | Name | Price | Access |
|------|------|-------|--------|
| Free | The Reader | $0 | Part I (Ch 1–4), 1 FATE Audit snapshot, 3 prep evaluations, limited Companion (10 msgs/day), 2 generators |
| Monthly | The Builder | $7/mo | Full book, all assessments, all generators, 1 pathway active, The Hall community |
| Annual | The Steward | $69/yr ($5.75/mo) | Full access — all pathways, all tools, community, scenario simulators |
| Lifetime | The Dynast | $199 one-time | Everything forever + all future releases (Forging Fathers, future titles in the series) |
| SP + DD Bundle | The Forge | $99/yr or $249 lifetime | Both sites, full access, shared account |

### Notes on Structure
- **Existing Stripe products (DD Basic + Premium):** Adapt these rather than rebuild — map Basic → The Builder, Premium → The Steward. Add Lifetime as a new product. Add The Forge bundle products.
- **Forging Fathers:** Lifetime and Forge Bundle holders get FF access at launch (March–April target). This is a meaningful selling point for Lifetime buyers and should be mentioned explicitly at checkout.
- **Lifetime tier incentive:** The Dynast also gets first access to new tools/pathways in beta, and is recognized in The Hall with a permanent `Dynast` badge.
- **Other monetization streams** (not subscription-dependent):
  - Physical book + workbooks (store.tronboll.us)
  - Domain-specific kits (curated starter packages — Living Pantry Kit, Water System Starter, etc.)
  - Custom coaching (calendar link; private sessions with the author)
  - Buy-me-a-coffee style support portal for readers who want to contribute without subscribing
  - Future: workshops, local circles, regional events
  - Future: affiliate-style referrals to vetted products/providers (HAM equipment, RMH resources) — handled carefully to preserve trust

### Cross-Site Account
- Same email/magic link as stoic.tronboll.us
- Account page shows both SP and DD status
- SP tier can upgrade in-place to include DD access
- "You have The Stoic Forge — add Discreet Dynasties for $X/yr"
- The Forge Bundle includes SP + DD + Forging Fathers on release

---

## Technical Phases

### Phase 0 — Scaffold (1-2 weeks)
Copy SP project structure. Set up:
- New Vercel project, point `discreet.tronboll.us`
- New Prisma schema (or extend SP's with `dd_` prefix namespacing)
- Extend Auth.js to recognize both sites (subdomain cookie handling)
- Extend Stripe to include DD products
- Base design tokens (extend SP's, add DD-specific `dynasty`/`hearth` variables)
- Seed DD book content into RAG

### Phase 1 — Core (3-4 weeks)
- Living Book (28 chapters, same UX as SP)
- Dynasty Companion (4 mentors, RAG-connected)
- FATE Audit (full multi-step assessment, saves to DB)
- Basic Armory (5 generators: FATE Action Plan, Stability Plan, Two-Family Checklist, Dead-to-Living, Gray Man Audit)
- Account with DD tier + SP bundle pricing

### Phase 2 — Pathways (3-4 weeks)
- FATE Foundation pathway (8 weeks)
- Living Preps Conversion pathway (12 weeks)
- The Gray Man Path (6 weeks)
- Progress tracking, tool-gated milestones
- The Vow milestone + Vow Wall in The Hall

### Phase 3 — Tool Suite (2-3 weeks)
- Dead/Zombie/Living Evaluator
- Gray Man Self-Audit
- Household Stability Plan Builder + PDF generation
- Dynasty Web Mapper
- Long Table assessment ("Where is your dynasty on the Long Table?")
- 5 more Armory generators

### Phase 4 — Advanced Systems (3-4 weeks)
- Energy Architecture Calculator
- Water System Designer
- Cubic Inch Farming Designer
- Resource Flow Mapper
- Income Ecosystem Builder
- Scenario Simulators (72-hour, Long Winter, Medical Event)

### Phase 5 — Community & Dynasty Web (2-3 weeks)
- The Yard (DD-specific Hearth categories)
- Skill Circles
- Dynasty Journals
- The Trusted List (regional directory)

### Phase 6 — Polish & Cross-Site (2 weeks)
- SP → DD progression triggers and funnels
- SP badge for DD enrollment
- Hearth unification (shared community, separated by category)
- Admin email tools for DD segment
- Analytics integration

---

## DB Schema Additions (New models, DD-prefixed)

```prisma
model DDFateAudit {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(...)
  takenAt       DateTime @default(now())
  
  // Scores: 0-3 per domain per level
  foodStability     Int
  foodContinuity    Int
  foodIntegrity     Int
  assuranceStability Int
  assuranceContinuity Int
  assuranceIntegrity Int
  toolsStability    Int
  toolsContinuity   Int
  toolsIntegrity    Int
  energyStability   Int
  energyContinuity  Int
  energyIntegrity   Int
  
  aiActionPlan  String?  @db.Text
  notes         String?  @db.Text
}

model DDPrepEvaluation {
  id          String   @id @default(cuid())
  userId      String
  prepName    String
  category    String   // food, water, energy, security, skills
  description String   @db.Text
  classification String // dead, zombie, living
  aiAnalysis  String   @db.Text
  conversionPlan String? @db.Text
  createdAt   DateTime @default(now())
}

model DDStabilityPlan {
  id          String   @id @default(cuid())
  userId      String
  hungerPlan  String   @db.Text
  waterPlan   String   @db.Text
  powerPlan   String   @db.Text
  medicalPlan String   @db.Text
  cashPlan    String   @db.Text
  givingThreshold String @db.Text
  lastUpdated DateTime @updatedAt
}

model DDPathwayEnrollment {
  id         String   @id @default(cuid())
  userId     String
  pathway    String   // fate-foundation, living-preps, gray-man, etc.
  weekNumber Int      @default(1)
  startedAt  DateTime @default(now())
  completedAt DateTime?
  lastActivity DateTime @updatedAt
  weekData   Json?    // per-week completion flags, tool results
}

// Reuses SP's HearthPost/Comment models with a `site` field added
// Or separate DD-specific tables
```

---

## Content Seeding

The book is ~72,000 words across 28 chapters + 8 appendices.  
Same chunking strategy as SP: 256-token chunks with overlap, stored in `book_chunks` with site=`dd` flag.  
Estimate: ~1,400 chunks (vs ~600 for SP's 9 chapters).  
Companion RAG will be notably richer.

---

## Resolved Decisions

1. **Shared DB** ✅ — Same Neon project, `dd_` table prefixes for isolation
2. **Separate communities** ✅ — The Hearth (SP) and **The Hall** (DD), cross-linked
3. **Companion archetypes** ✅ — Steward / Shepherd / Sheepdog / Maker (plus historical & Biblical advisor roster — see below)
4. **Pricing** ✅ — See tier structure above. $7/mo entry, $69/yr, $199 lifetime, $249 SP+DD lifetime bundle
5. **Forging Fathers** ✅ — Included in Lifetime and Forge Bundle on release (March–April target)
6. **The Vow** ✅ — Formal milestone after FATE Foundation completion; The Vow Wall in The Hall
7. **Phase order** ✅ — Phase 2 = Pathways, Phase 3 = Tool Suite
8. **The Trusted List** ✅ — Phase 5
9. **Dynasty Journals** ✅ — Opt-in only
10. **Coaching portal** ✅ — Post-launch, but v1 design must include the slot (account page section, placeholder CTA, Stripe product scaffolded)
11. **The Hall** ✅ — Confirmed community name for DD
12. **The Long Table** ✅ — Named framework (see below) — NOT just a community name, but a doctrine of civic expansion

## The Long Table — A Named Framework

The Two-Family Standard (from SP) is the seed. The Long Table is what grows from it over decades.

**The Two-Family Standard** asks: *What kind of neighbor do I intend to be?*  
**The Long Table** asks: *What kind of community — and eventually, what kind of civic order — does my dynasty help build?*

The Long Table is the DD doctrine of outward expansion through quiet service and competence:

| Level | Scope | Practice |
|-------|-------|----------|
| 1 | Your household | FATE Foundation — physical, financial, spiritual readiness |
| 2 | Two-Family Standard | Your household + one equal household prepared alongside you |
| 3 | The Neighborhood | Quiet Mutual Aid — vulnerability mapping, skill sharing, norm-setting |
| 4 | The Long Table | Your trusted circle — the tradespeople, professionals, civic servants at your table |
| 5 | The Civic Extension | Seeking positions of quiet service: Sheriff, DA, school board, water district, planning commission, mayor |
| 6 | The Regional Foundation | Your dynasty's footprint — 20 and 50-year civic presence |

**Level 4 is the pivot.** The Long Table is where you recognize that the city worker who maintains the water lines, the lineman who restores power, the farmer and rancher who feeds the county, the electrician, the plumber, the carpenter, the volunteer fire captain — these men and women are the dynasty's *actual* infrastructure. Building relationships with them before you need them is not networking. It is the practice of justice made concrete.

**Level 5 is the natural outcome.** Not power-seeking. Not political ambition. But recognizing that the Sheriff's office, the DA's seat, the city council chair — these are *positions of stewardship* that someone will fill. The discreet dynasty-builder understands that if people of character don't fill them, people of a different character will.

This framework gets its own section in the site — not buried in a pathway, but standing alongside FATE as a primary organizing doctrine. It could have its own `/long-table` page, a companion conversation thread, an assessment ("Where is your dynasty on the Long Table?"), and a generator ("Who should be at your table that isn't yet?").

---

## Coaching Portal (Post-Launch, Planned in v1)

Cal.com embed + Stripe payment link. Post-launch delivery, but v1 must:
- Reserve the slot in the account page ("Private Coaching — Coming Soon")
- Scaffold the Stripe product (coaching session SKU) so it's ready to activate
- Include a waitlist signup on the placeholder so early interest is captured

When live: 60-minute private sessions with the author, booked directly through the site. The man who builds something serious and hits a genuine decision point — trust structure, energy system, Long Table civic move — has someone to call.

---

## The Mission Statement (Homepage & About Page)

This belongs on the site in plain language. Not as a tagline. Not as a slogan. As the closing statement — the real why, said plainly, without embarrassment.

> *The household is the first institution. When it is strong, everything downstream is stronger. When it fails, nothing downstream recovers easily.*
>
> *We are not building for the apocalypse. We are building for the long arc — for the generation that will carry what we began, for the neighbors who will need what we prepared, for the community that only holds together when enough families are capable of holding it.*
>
> *Getting people to start building their dynasties is not a business goal. It is what will preserve what is worth preserving in this country. One household at a time. Quietly. Faithfully. Without drama.*
>
> *That is what this is for.*

This statement — or a version of it refined in the author's voice — closes the homepage, anchors the About page, and frames the Vow. It is the answer to every person who asks "why does this site exist?"

---

## What discreet.tronboll.us Is, Ultimately

Not a prep site. Not a homesteading blog. Not a survivalist forum.

**A platform for men building households that will outlast them** — and a community of men doing that work together, quietly, at the Long Table.

The tools, the book, the companion, the pathways — all of it exists to convert the reader from someone who knows the philosophy to someone actively building the systems. Domain by domain. Generation by generation. Level by level on the Long Table.

The Stoic Forge teaches you why. The Discreet Dynasty shows you how. And the Long Table shows you who else is doing it alongside you.
