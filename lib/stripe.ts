import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim())
  }
  return _stripe
}

export const PRICE_IDS = {
  dd_basic: process.env.STRIPE_PRICE_DD_BUILDER_MONTHLY?.trim() || '',
  dd_premium: process.env.STRIPE_PRICE_DD_STEWARD_ANNUAL?.trim() || '',
  dd_dynast: process.env.STRIPE_PRICE_DD_DYNAST_LIFETIME?.trim() || '',
  forge_bundle: process.env.STRIPE_PRICE_FORGE_BUNDLE?.trim() || '',
} as const

export function priceIdToRole(priceId: string): string {
  for (const [role, id] of Object.entries(PRICE_IDS)) {
    if (id && id === priceId) return role
  }
  return 'free'
}

export const PLAN_DETAILS = {
  dd_basic: {
    name: 'Builder',
    price: '$7/mo',
    interval: 'monthly',
    description: 'Access the Living Book, FATE Audit, and guided pathways.',
    features: [
      'Full Living Book (28 chapters)',
      'FATE Audit tool',
      '3 guided pathways',
      'Dynasty Companion (Steward archetype)',
      'The Hall community',
    ],
  },
  dd_premium: {
    name: 'Steward',
    price: '$69/yr',
    interval: 'annual',
    description: 'Full armory, all pathways, all companion archetypes.',
    features: [
      'Everything in Builder',
      'Full Armory (15+ generators)',
      'All 6 guided pathways',
      'All 4 companion archetypes',
      'Historical & Biblical advisors',
      'Dynasty Journal',
      'Priority access to new tools',
    ],
  },
  dd_dynast: {
    name: 'Dynast',
    price: '$199 lifetime',
    interval: 'lifetime',
    description: 'Permanent access. The Vow. Forging Fathers included.',
    features: [
      'Everything in Steward',
      'Lifetime access — no renewals',
      'Forging Fathers program included',
      'The Vow milestone access',
      'Long Table Civic Framework',
      'Council Mode (2 advisors)',
      'Early access to all future content',
    ],
  },
  forge_bundle: {
    name: 'Forge Bundle',
    price: '$249 lifetime',
    interval: 'lifetime',
    description: 'Discreet Dynasties + Stoic Preparedness. Both forges, one lifetime.',
    features: [
      'Everything in Dynast',
      'Full Stoic Preparedness access',
      'Both Stoic + Dynasty Companions',
      'Cross-forge progress tracking',
    ],
  },
} as const
