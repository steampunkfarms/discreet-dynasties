import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import ArmoryGenerator from './ArmoryGenerator'

const GENERATORS: Record<string, {
  title: string
  desc: string
  tier: 'builder' | 'steward'
  fields: Array<{ key: string; label: string; type: 'text' | 'number' | 'textarea' | 'select'; options?: string[]; placeholder?: string }>
}> = {
  'fate-roadmap': {
    title: 'FATE Improvement Roadmap',
    desc: 'A custom 90-day plan for your weakest FATE domain.',
    tier: 'builder',
    fields: [
      { key: 'weakestDomain', label: 'Weakest FATE domain', type: 'select', options: ['Food', 'Assurance', 'Tools & Skills', 'Energy'] },
      { key: 'currentLevel', label: 'Current level in that domain', type: 'select', options: ['Not started', 'Stability (30-day)', 'Continuity (90-day)', 'Integrity'] },
      { key: 'householdSize', label: 'Household size', type: 'number', placeholder: '4' },
      { key: 'propertyType', label: 'Property type', type: 'select', options: ['Urban apartment', 'Suburban home', 'Rural property', 'Small farm'] },
      { key: 'constraints', label: 'Main constraints (time, budget, space?)', type: 'textarea', placeholder: 'Limited budget, small yard, full-time job…' },
    ],
  },
  'stability-plan': {
    title: 'Household Stability Plan',
    desc: 'A complete stability protocol for your household.',
    tier: 'builder',
    fields: [
      { key: 'householdSize', label: 'Household size', type: 'number', placeholder: '4' },
      { key: 'ages', label: 'Ages in household (e.g. 38, 35, 12, 8)', type: 'text', placeholder: '38, 35, 12, 8' },
      { key: 'propertyType', label: 'Property type', type: 'select', options: ['Urban apartment', 'Suburban home', 'Rural property', 'Small farm'] },
      { key: 'topVulnerability', label: 'Your biggest vulnerability right now', type: 'textarea', placeholder: 'We have no food storage, two weeks of cash, no generator…' },
    ],
  },
  'food-storage-calculator': {
    title: 'Food Storage Calculator',
    desc: 'Caloric needs, variety, and storage specs for your household.',
    tier: 'builder',
    fields: [
      { key: 'householdSize', label: 'Household size', type: 'number', placeholder: '4' },
      { key: 'ages', label: 'Ages (e.g. 38, 35, 12, 8)', type: 'text', placeholder: '38, 35, 12, 8' },
      { key: 'targetDays', label: 'Target days of storage', type: 'select', options: ['30 days', '60 days', '90 days', '6 months', '1 year'] },
      { key: 'dietaryNotes', label: 'Dietary notes or restrictions', type: 'text', placeholder: 'No allergies; one person gluten-free…' },
      { key: 'storageSpace', label: 'Available storage space', type: 'select', options: ['1 closet', '1 pantry', '1 room', 'Basement', 'Garage + more'] },
    ],
  },
  'dead-preps-audit': {
    title: 'Dead Preps Audit',
    desc: 'Classify every prep as Dead, Zombie, or Living. Get a resurrection plan.',
    tier: 'builder',
    fields: [
      { key: 'prepList', label: 'List every prep you own (one per line)', type: 'textarea', placeholder: '5-year-old water filter\nGas generator (untested for 2 years)\nFAK with expired medications\nSolar charger (works but no protocol)\nHandgun (maintained, practiced monthly)' },
      { key: 'topWorry', label: 'Which prep concerns you most?', type: 'text', placeholder: "The generator — I don't know if it starts" },
    ],
  },
  'long-table-map': {
    title: 'Long Table Circle Map',
    desc: 'Map your trusted network across all six Long Table levels.',
    tier: 'builder',
    fields: [
      { key: 'householdSize', label: 'Household size', type: 'number', placeholder: '4' },
      { key: 'currentCircle', label: 'Who is currently in your Trusted List (roles, not names)?', type: 'textarea', placeholder: 'Brother (trained medic), neighbor (farmer), old friend (former military)…' },
      { key: 'gaps', label: 'What skills or roles are missing from your circle?', type: 'textarea', placeholder: 'No medical professional, no one with solar experience…' },
      { key: 'ambition', label: 'Long Table ambition level', type: 'select', options: ['Two-family standard only', 'Neighborhood level', 'Long Table (trusted circle)', 'Civic Extension'] },
    ],
  },
  'fate-letter': {
    title: 'Dynasty Letter',
    desc: 'A letter to your children explaining your household\'s FATE posture.',
    tier: 'steward',
    fields: [
      { key: 'childrenAges', label: 'Children\'s ages (approximate)', type: 'text', placeholder: '14, 11, 7' },
      { key: 'whyBuilding', label: 'In your own words: why are you building this?', type: 'textarea', placeholder: 'I watched my father lose everything in 2008 and swore I would never put my family in that position…' },
      { key: 'coreValues', label: 'Core values you want to pass on', type: 'textarea', placeholder: 'Self-reliance, faith, care for community, stoic endurance…' },
      { key: 'fateStatus', label: 'Current FATE status (honest summary)', type: 'textarea', placeholder: 'Food at Stability, Assurance weak, Tools strong, Energy working on it…' },
    ],
  },
  'trusted-list-profile': {
    title: 'Trusted List Profile',
    desc: 'Criteria and a formal profile for each Trusted List member.',
    tier: 'steward',
    fields: [
      { key: 'personRole', label: 'Role of person you\'re profiling', type: 'text', placeholder: 'Neighbor, childhood friend, brother-in-law…' },
      { key: 'knowThem', label: 'How long have you known them and in what capacity?', type: 'textarea', placeholder: "12 years as neighbors; we've worked on projects together, shared meals, been through tough moments" },
      { key: 'theirStrengths', label: 'Their relevant strengths or skills', type: 'textarea', placeholder: 'Mechanical, calm under pressure, large property with water access…' },
      { key: 'concerns', label: 'Any concerns or unknowns', type: 'textarea', placeholder: 'Extended family situation unclear; not sure of their preparedness level…' },
    ],
  },
  'vow-draft': {
    title: 'The Vow Draft',
    desc: 'A personal draft of The Vow — your covenant with dynastic time.',
    tier: 'steward',
    fields: [
      { key: 'whyBuilding', label: 'Why are you building? What drives this?', type: 'textarea', placeholder: 'My grandfather built something that lasted. I want to do the same.' },
      { key: 'whatYoureBuilding', label: 'What specifically are you building?', type: 'textarea', placeholder: 'A household that is fed, protected, and connected to its community regardless of circumstance.' },
      { key: 'forWhom', label: 'Who are you building for?', type: 'textarea', placeholder: "My wife, my three children, my grandchildren I haven't met yet." },
      { key: 'commitment', label: 'What are you committing to change or maintain?', type: 'textarea', placeholder: 'No more consumer debt. Monthly FATE review. The Vow taken by 40.' },
    ],
  },
  'energy-plan': {
    title: 'Energy Independence Plan',
    desc: 'A phased plan to move from grid-dependent to grid-optional.',
    tier: 'steward',
    fields: [
      { key: 'propertyType', label: 'Property type', type: 'select', options: ['Urban apartment', 'Suburban home', 'Rural property', 'Small farm'] },
      { key: 'currentPower', label: 'Current power setup', type: 'textarea', placeholder: 'Grid only; no generator; gas stove; electric HVAC' },
      { key: 'waterSource', label: 'Current water source', type: 'select', options: ['Municipal only', 'Municipal + well', 'Well only', 'Rainwater + municipal', 'Full water independence'] },
      { key: 'budget', label: 'Annual budget for energy upgrades', type: 'select', options: ['Under $500', '$500–$2,000', '$2,000–$5,000', '$5,000–$15,000', '$15,000+'] },
      { key: 'timeline', label: 'Target timeline', type: 'select', options: ['1 year', '2–3 years', '5 years', 'Long-term (10+ years)'] },
    ],
  },
  'dynasty-wealth-plan': {
    title: 'Dynasty Wealth Plan',
    desc: 'A household financial sovereignty roadmap.',
    tier: 'steward',
    fields: [
      { key: 'income', label: 'Household income range', type: 'select', options: ['Under $50k', '$50k–$80k', '$80k–$120k', '$120k–$200k', '$200k+'] },
      { key: 'debtLevel', label: 'Current debt situation', type: 'select', options: ['Debt-free', 'Mortgage only', 'Mortgage + car', 'Mortgage + consumer debt', 'Significant consumer debt'] },
      { key: 'emergencyFund', label: 'Emergency fund status', type: 'select', options: ['None', '< 1 month', '1–3 months', '3–6 months', '6+ months'] },
      { key: 'investmentStatus', label: 'Investment / retirement status', type: 'select', options: ['No investments', '401k only', '401k + IRA', 'Diversified portfolio', 'Real estate / business assets'] },
      { key: 'topGoal', label: 'Top financial sovereignty goal', type: 'textarea', placeholder: 'Pay off all debt in 3 years and build a 6-month fund' },
    ],
  },
}

interface Props { params: { slug: string } }

export default async function ArmorySlugPage({ params }: Props) {
  const generator = GENERATORS[params.slug]
  if (!generator) notFound()

  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  if (!isPaid) redirect('/join')
  if (generator.tier === 'steward' && !isSteward) redirect('/join')

  return (
    <ArmoryGenerator
      slug={params.slug}
      title={generator.title}
      desc={generator.desc}
      fields={generator.fields}
    />
  )
}
