export type FateDomain = 'food' | 'assurance' | 'tools' | 'energy'
export type FateLevel = 0 | 1 | 2 | 3 // 0=unscored, 1=stability, 2=continuity, 3=integrity

export interface FateScore {
  food: FateLevel
  assurance: FateLevel
  tools: FateLevel
  energy: FateLevel
}

export interface FateQuestion {
  id: string
  domain: FateDomain
  level: FateLevel
  text: string
  helpText?: string
}

export const FATE_QUESTIONS: FateQuestion[] = [
  // FOOD — Level 1 (Stability)
  { id: 'f1a', domain: 'food', level: 1, text: 'We have at least 30 days of caloric food stored for every household member.', helpText: '~2,000 calories/day/person. Count what you actually have, not what you intend to buy.' },
  { id: 'f1b', domain: 'food', level: 1, text: 'We have a manual can opener, and all stored food can be eaten without power or cooking.', helpText: 'Ready-to-eat, no prep required.' },
  { id: 'f1c', domain: 'food', level: 1, text: 'We rotate our food storage — nothing is expired.', helpText: 'FIFO (first in, first out). If you don\'t know the dates, score this 0.' },

  // FOOD — Level 2 (Continuity)
  { id: 'f2a', domain: 'food', level: 2, text: 'We have 90+ days of caloric food stored.', helpText: 'Three months of independence for your household.' },
  { id: 'f2b', domain: 'food', level: 2, text: 'We can cook without grid power (propane, wood stove, rocket stove, or similar).', helpText: 'Not just a camp stove — a real cooking solution.' },
  { id: 'f2c', domain: 'food', level: 2, text: 'We have at least one food production capability (garden, chickens, hunting/fishing license + skill).', helpText: 'Something that grows or is harvested, not just stored.' },

  // FOOD — Level 3 (Integrity)
  { id: 'f3a', domain: 'food', level: 3, text: 'We have 12+ months of food production capacity.', helpText: 'Enough to feed the household primarily from production, not storage.' },
  { id: 'f3b', domain: 'food', level: 3, text: 'We have surplus food we could share with another household.', helpText: 'The Two-Family Standard: prepared for two.' },

  // ASSURANCE — Level 1 (Stability)
  { id: 'a1a', domain: 'assurance', level: 1, text: 'We have 30 days of cash or accessible emergency funds.', helpText: 'Not counting investments or retirement — truly accessible within 24 hours.' },
  { id: 'a1b', domain: 'assurance', level: 1, text: 'We have copies of all critical documents stored securely off-site or digitally encrypted.', helpText: 'Birth certificates, deeds, insurance policies, passports.' },
  { id: 'a1c', domain: 'assurance', level: 1, text: 'We have a basic first aid kit and at least one person trained in basic first aid/CPR.', helpText: 'A stocked kit, not just a box of Band-Aids.' },

  // ASSURANCE — Level 2 (Continuity)
  { id: 'a2a', domain: 'assurance', level: 2, text: 'We have 90+ days of emergency funds and carry zero consumer debt.', helpText: 'No credit card balances, no BNPL. Mortgage/auto loan acceptable.' },
  { id: 'a2b', domain: 'assurance', level: 2, text: 'We have a defensible home security posture — hardware, awareness, and a plan.', helpText: 'Reinforced entry points, exterior lighting, a practiced plan for intrusion.' },
  { id: 'a2c', domain: 'assurance', level: 2, text: 'At least one adult in the household has Wilderness First Responder or equivalent medical training.', helpText: 'Beyond basic first aid — can manage emergencies when EMS is unavailable.' },

  // ASSURANCE — Level 3 (Integrity)
  { id: 'a3a', domain: 'assurance', level: 3, text: 'We have 12+ months of operating expenses in accessible funds, plus a fully funded investment position.', helpText: 'Dynasty Wealth: the household can weather a year-long income disruption.' },
  { id: 'a3b', domain: 'assurance', level: 3, text: 'We have estate planning complete (will, trust, guardianship designations, medical directives).', helpText: 'The dynasty plan extends past your lifetime.' },

  // TOOLS & SKILLS — Level 1 (Stability)
  { id: 't1a', domain: 'tools', level: 1, text: 'We have basic hand tools and know how to use them (hammer, saw, wrench set, drill).', helpText: 'And they are maintained, not just owned.' },
  { id: 't1b', domain: 'tools', level: 1, text: 'At least one adult can perform basic home repairs (plumbing, electrical, carpentry) without calling a contractor.', helpText: 'Fixing a running toilet, replacing an outlet, patching drywall.' },
  { id: 't1c', domain: 'tools', level: 1, text: 'We can navigate and communicate without smartphones (paper maps, two-way radios or HAM).', helpText: 'Minimal dependency on cell networks.' },

  // TOOLS & SKILLS — Level 2 (Continuity)
  { id: 't2a', domain: 'tools', level: 2, text: 'At least one adult has trauma care skills beyond basic first aid (tourniquet, wound packing, airway management).', helpText: 'Stop the Bleed trained or equivalent.' },
  { id: 't2b', domain: 'tools', level: 2, text: 'We have a full complement of hand tools capable of building or repairing major household systems.', helpText: 'Not just fixing — building if needed.' },
  { id: 't2c', domain: 'tools', level: 2, text: 'At least one adult holds a HAM radio license and operates regularly.', helpText: 'Technician class minimum; General class preferred.' },

  // TOOLS & SKILLS — Level 3 (Integrity)
  { id: 't3a', domain: 'tools', level: 3, text: 'We have a workshop or dedicated skill-building space with power tools and full hand tool complement.', helpText: 'A real maker space, not a junk drawer.' },
  { id: 't3b', domain: 'tools', level: 3, text: 'We can teach the skills we have — we have passed them to the next generation or to others in our circle.', helpText: 'Knowledge that lives beyond one person.' },

  // ENERGY — Level 1 (Stability)
  { id: 'e1a', domain: 'energy', level: 1, text: 'We have 72+ hours of emergency lighting and can maintain basic home temperature without grid power.', helpText: 'Candles, headlamps, lanterns. Blankets, sleeping bags rated to local lows.' },
  { id: 'e1b', domain: 'energy', level: 1, text: 'We have a water storage of at least 1 gallon/person/day for 14 days.', helpText: 'In sealed containers, rotated. Tap water in jugs counts if dated and rotated.' },
  { id: 'e1c', domain: 'energy', level: 1, text: 'We have a water filtration method capable of producing safe drinking water from non-tap sources.', helpText: 'Berkey, Sawyer, or equivalent gravity/pump filter.' },

  // ENERGY — Level 2 (Continuity)
  { id: 'e2a', domain: 'energy', level: 2, text: 'We have a generator (gas, propane, or solar) capable of running critical appliances.', helpText: 'Refrigerator, well pump, medical equipment, communication gear.' },
  { id: 'e2b', domain: 'energy', level: 2, text: 'We have 30+ days of fuel for heating and cooking systems.', helpText: 'Propane, firewood, or other stored fuel source.' },
  { id: 'e2c', domain: 'energy', level: 2, text: 'We have a rainwater collection or alternative water system beyond stored bottles.', helpText: 'Cistern, rain barrel, or well.' },

  // ENERGY — Level 3 (Integrity)
  { id: 'e3a', domain: 'energy', level: 3, text: 'We have solar + battery backup capable of powering the household for 7+ days without grid input.', helpText: 'Not just a panel — a whole-home system with storage.' },
  { id: 'e3b', domain: 'energy', level: 3, text: 'We have a gravity-fed or year-round alternative water supply independent of municipal systems.', helpText: 'Well, spring, or cistern fed by reliable collection.' },
]

export function scoreFateAudit(answers: Record<string, boolean>): FateScore {
  const domains: FateDomain[] = ['food', 'assurance', 'tools', 'energy']
  const result: Partial<FateScore> = {}

  for (const domain of domains) {
    const domainQuestions = FATE_QUESTIONS.filter(q => q.domain === domain)
    const level3 = domainQuestions.filter(q => q.level === 3)
    const level2 = domainQuestions.filter(q => q.level === 2)
    const level1 = domainQuestions.filter(q => q.level === 1)

    const l1Pass = level1.every(q => answers[q.id])
    const l2Pass = level2.every(q => answers[q.id])
    const l3Pass = level3.every(q => answers[q.id])

    if (l1Pass && l2Pass && l3Pass) result[domain] = 3
    else if (l1Pass && l2Pass) result[domain] = 2
    else if (l1Pass) result[domain] = 1
    else result[domain] = 0
  }

  return result as FateScore
}

export function getFateLevelLabel(level: FateLevel): string {
  return ['Unscored', 'Stability', 'Continuity', 'Integrity'][level]
}

export function getWeakestDomain(scores: FateScore): FateDomain {
  const domains: FateDomain[] = ['food', 'assurance', 'tools', 'energy']
  return domains.reduce((weakest, domain) =>
    scores[domain] < scores[weakest] ? domain : weakest
  )
}
