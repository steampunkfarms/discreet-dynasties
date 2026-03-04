export interface DDPathway {
  slug: string
  title: string
  subtitle: string
  icon: string
  tier: 'builder' | 'steward'
  fateDomain?: 'food' | 'assurance' | 'tools' | 'energy' | 'all'
  weekCount: number
  description: string
  weeks: PathwayWeek[]
}

export interface PathwayWeek {
  number: number
  title: string
  action: string
  reflection: string
}

export const DD_PATHWAYS: DDPathway[] = [
  {
    slug: 'fate-foundation',
    title: 'FATE Foundation',
    subtitle: '5 weeks to your first complete audit',
    icon: '⚖',
    tier: 'builder',
    fateDomain: 'all',
    weekCount: 5,
    description: 'A structured 5-week journey through your first FATE Audit. Score each domain honestly. Walk away with a clear picture of where you stand and what to build first.',
    weeks: [
      { number: 1, title: 'Baseline', action: 'Complete your FATE Audit honestly. Score all four domains.', reflection: 'What surprised you most about your current level? Where did you expect to score higher than you did?' },
      { number: 2, title: 'Food', action: 'Inventory your food storage. Count calories, check dates, identify gaps.', reflection: 'If grid power and grocery stores disappeared for 30 days, could you feed your household? What is the weakest link?' },
      { number: 3, title: 'Assurance', action: 'Review your emergency funds, document storage, and home security posture.', reflection: 'Which of the three — money, documents, or security — is most neglected? Why?' },
      { number: 4, title: 'Tools & Energy', action: 'Inventory your tools, test your generator, and check your water storage.', reflection: 'What skill do you rely on contractors or professionals for that you could reasonably learn yourself?' },
      { number: 5, title: 'Your Next 90 Days', action: 'Write a 90-day FATE improvement plan. One priority per domain.', reflection: 'What is the single highest-leverage action you could take this week? Not this quarter — this week.' },
    ],
  },
  {
    slug: 'living-preps',
    title: 'Living Preps',
    subtitle: '6 weeks to convert dead and zombie systems',
    icon: '🔄',
    tier: 'builder',
    fateDomain: 'all',
    weekCount: 6,
    description: 'Audit every preparedness system in your household. Classify each as Dead, Zombie, or Living. Build a conversion protocol to bring neglected systems back to life.',
    weeks: [
      { number: 1, title: 'The Audit', action: 'List every preparedness system or item in your home. Classify each as Dead (gone/unusable), Zombie (neglected/untested), or Living (maintained/ready).', reflection: 'What did you forget you had? What did you find that was worse than expected?' },
      { number: 2, title: 'Dead Preps', action: 'Deal with dead preps: dispose, replace, or decide not to replace. No hoarding of broken systems.', reflection: 'Why did these fall into disuse? Was it lack of time, knowledge, or motivation?' },
      { number: 3, title: 'Zombie Preps', action: 'Pick your three most important zombie preps. Bring one fully back to life this week.', reflection: 'What does it cost (time, money, effort) to resurrect a zombie prep? Is it worth it?' },
      { number: 4, title: 'Maintenance System', action: 'Create a simple maintenance calendar for all living preps. Quarterly checks minimum.', reflection: 'What prep requires the most regular maintenance? Are you willing to commit to it?' },
      { number: 5, title: 'Skills vs. Gear', action: 'For each living prep, note whether a skill gap or a gear gap is the bigger vulnerability.', reflection: 'Where are you gear-heavy but skill-light? What could you do today to shift the balance?' },
      { number: 6, title: 'The Living System Review', action: 'Reassess your full list. How many items are now Living?', reflection: 'What would it feel like to have every prep fully active? What stands between you and that state?' },
    ],
  },
  {
    slug: 'gray-man',
    title: 'The Gray Man',
    subtitle: '4 weeks to capability without spectacle',
    icon: '〇',
    tier: 'builder',
    fateDomain: 'assurance',
    weekCount: 4,
    description: 'Strength that does not announce itself. Learn to build genuine capability while reducing your household\'s visible profile. This pathway is not about hiding — it is about discretion.',
    weeks: [
      { number: 1, title: 'Profile Assessment', action: 'Assess your household\'s current visibility profile. What do neighbors, acquaintances, and online contacts know about your preparations?', reflection: 'Have you inadvertently signaled more than you intended? What would you change?' },
      { number: 2, title: 'Information Hygiene', action: 'Review your social media for anything that signals vulnerability or excess. Tighten privacy settings.', reflection: 'What is the line between honest community building and broadcasting your capabilities?' },
      { number: 3, title: 'Vehicle & Property', action: 'Walk your property as a stranger would. What signals preparedness? What signals vulnerability?', reflection: 'What minor changes would shift your property toward neutral without sacrificing capability?' },
      { number: 4, title: 'The Conversation Test', action: 'Practice how you talk about your household\'s preparedness to different audiences. Develop your language.', reflection: 'How do you speak about preparedness to close family, to coworkers, to neighbors? Where does your approach need refinement?' },
    ],
  },
  {
    slug: 'energy-independence',
    title: 'Energy Independence',
    subtitle: '8 weeks to power and water sovereignty',
    icon: '⚡',
    tier: 'steward',
    fateDomain: 'energy',
    weekCount: 8,
    description: 'The E in FATE. Build toward household energy and water independence systematically. From 72-hour readiness through whole-home resilience.',
    weeks: [
      { number: 1, title: 'Energy Audit', action: 'List every power-dependent system in your home. Prioritize by criticality.', reflection: 'What would fail first without grid power? What is truly essential vs. comfortable?' },
      { number: 2, title: 'Water Audit', action: 'Map your water dependency. How much do you store? How would you resupply?', reflection: 'If municipal water pressure failed tomorrow, how long before your household experienced real hardship?' },
      { number: 3, title: '72-Hour Power', action: 'Ensure you can maintain light, heat/cooling, and communication for 72 hours without grid.', reflection: 'Have you tested this? A plan that has never been tested is a plan that will fail.' },
      { number: 4, title: 'Generator Assessment', action: 'Research, acquire, or test a generator capable of running critical appliances. Calculate fuel needs.', reflection: 'Is a gas generator the right solution for your household, or would propane or solar better serve your situation?' },
      { number: 5, title: 'Water Storage', action: 'Build to 1 gallon/person/day × 30 days. Test your filtration system on an actual non-tap water source.', reflection: 'How did the filtration test go? What did you learn that you did not expect?' },
      { number: 6, title: 'Solar Assessment', action: 'Assess whether a solar+battery system is viable for your property. Price it out.', reflection: 'Is solar a near-term priority or a 3-year goal? What would need to change to accelerate it?' },
      { number: 7, title: 'Alternative Water', action: 'Identify a non-municipal water source within reach: well, rain collection, spring, or cistern.', reflection: 'What is the realistic long-term water plan for your household property?' },
      { number: 8, title: 'Full Energy Plan', action: 'Write your household Energy Independence plan from current state to Integrity level.', reflection: 'What is your single highest-leverage energy action for the next 90 days?' },
    ],
  },
  {
    slug: 'dynasty-wealth',
    title: 'Dynasty Wealth',
    subtitle: '6 weeks to financial household sovereignty',
    icon: '⬡',
    tier: 'steward',
    fateDomain: 'assurance',
    weekCount: 6,
    description: 'The financial dimension of the FATE Assurance domain. Not wealth for status — wealth as the foundation of household independence and the ability to help others.',
    weeks: [
      { number: 1, title: 'Honest Financial Audit', action: 'List every debt, asset, and income stream. Calculate your household\'s financial runway.', reflection: 'If your primary income stopped tomorrow, how many months before genuine hardship?' },
      { number: 2, title: 'Debt as Vulnerability', action: 'Identify every consumer debt. Create a payoff sequence using debt avalanche or snowball method.', reflection: 'What does your debt represent in terms of household sovereignty? What did you trade for it?' },
      { number: 3, title: 'Emergency Foundation', action: 'Build or verify a 30-day emergency fund in a liquid, accessible account.', reflection: 'Is your emergency fund truly accessible, or would you face friction or penalties to reach it?' },
      { number: 4, title: 'Income Sovereignty', action: 'Assess your income diversification. Do you have any income that does not depend on a single employer?', reflection: 'What skill, asset, or capability could produce income independent of your primary employer?' },
      { number: 5, title: 'Dynasty Investment', action: 'Review your investment strategy through the lens of dynasty thinking: low fees, long horizon, generational.', reflection: 'Are you investing for your retirement or for your dynasty? What is the difference in practice?' },
      { number: 6, title: 'The Financial Plan', action: 'Write a one-page household financial sovereignty plan: debt payoff, fund targets, investment strategy.', reflection: 'What would complete financial sovereignty feel like? What stands between you and that state today?' },
    ],
  },
  {
    slug: 'quiet-mutual-aid',
    title: 'Quiet Mutual Aid',
    subtitle: '5 weeks to Long Table readiness',
    icon: '⌂',
    tier: 'steward',
    fateDomain: 'all',
    weekCount: 5,
    description: 'The outward turn of dynasty building. Learn to extend help without creating dependency, build trusted circles without broadcasting capability, and begin the Long Table journey.',
    weeks: [
      { number: 1, title: 'Your Circle', action: 'Map your trusted network. Who would you call in a true emergency? Who would call you?', reflection: 'How many people in your network are more prepared than you? Less prepared? What does that ratio tell you?' },
      { number: 2, title: 'Two-Family Standard', action: 'Honestly assess: could you shelter and feed one additional household for 30 days today?', reflection: 'If the answer is no, what is the single most important step toward yes?' },
      { number: 3, title: 'The Trusted List', action: 'Draft your household\'s Trusted List: the 3-5 households you would share resources with in a genuine crisis.', reflection: 'What criteria determined who made the list? What criteria disqualified others?' },
      { number: 4, title: 'Aid Without Dependency', action: 'Review past situations where you helped others. Was the help genuinely useful, or did it create dependency?', reflection: 'What is the difference between aid that builds and aid that erodes? Where is that line in your practice?' },
      { number: 5, title: 'The Long Table Plan', action: 'Write your household\'s Long Table vision: how far do you want to extend your circle of readiness?', reflection: 'Where on the Long Table spectrum do you feel called right now: Two-Family, Neighborhood, Civic Extension? Why there?' },
    ],
  },
]

export function getPathwayBySlug(slug: string): DDPathway | undefined {
  return DD_PATHWAYS.find(p => p.slug === slug)
}
