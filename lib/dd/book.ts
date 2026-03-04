export interface DDChapter {
  slug: string
  number: number
  title: string
  subtitle?: string
  tier: 'free' | 'builder' | 'steward'
  section: 'foundation' | 'fate' | 'preps' | 'long-table' | 'vow'
}

export const DD_CHAPTERS: DDChapter[] = [
  // SECTION I — FOUNDATION
  { slug: 'why-dynasties', number: 1, title: 'Why Dynasties', subtitle: 'The Case for Building to Last', tier: 'free', section: 'foundation' },
  { slug: 'the-discreet-principle', number: 2, title: 'The Discreet Principle', subtitle: 'Strength That Does Not Announce Itself', tier: 'free', section: 'foundation' },
  { slug: 'the-vow-defined', number: 3, title: 'The Vow Defined', subtitle: 'A Covenant With Time', tier: 'free', section: 'foundation' },
  { slug: 'gray-man', number: 4, title: 'The Gray Man', subtitle: 'Capability Without Spectacle', tier: 'builder', section: 'foundation' },
  { slug: 'household-sovereignty', number: 5, title: 'Household Sovereignty', subtitle: 'The First Jurisdiction You Must Win', tier: 'builder', section: 'foundation' },

  // SECTION II — THE FATE MODEL
  { slug: 'fate-overview', number: 6, title: 'The FATE Model', subtitle: 'Food, Assurance, Tools & Skills, Energy', tier: 'free', section: 'fate' },
  { slug: 'fate-food', number: 7, title: 'F — Food', subtitle: 'Caloric Independence and the Feeding Chain', tier: 'builder', section: 'fate' },
  { slug: 'fate-assurance', number: 8, title: 'A — Assurance', subtitle: 'Financial, Legal, Medical, and Security Readiness', tier: 'builder', section: 'fate' },
  { slug: 'fate-tools-skills', number: 9, title: 'T — Tools & Skills', subtitle: 'Knowledge That Lives in Hands', tier: 'builder', section: 'fate' },
  { slug: 'fate-energy', number: 10, title: 'E — Energy', subtitle: 'Power, Water, Heat — The Infrastructure of Life', tier: 'builder', section: 'fate' },
  { slug: 'fate-audit-guide', number: 11, title: 'The FATE Audit', subtitle: 'Honest Assessment as First Step', tier: 'builder', section: 'fate' },

  // SECTION III — LIVING PREPS
  { slug: 'dead-zombie-living', number: 12, title: 'Dead, Zombie, and Living Preps', subtitle: 'Classifying What You Have', tier: 'free', section: 'preps' },
  { slug: 'converting-zombie-preps', number: 13, title: 'Converting Zombie Preps', subtitle: 'From Neglect to Activation', tier: 'builder', section: 'preps' },
  { slug: 'the-living-system', number: 14, title: 'The Living System', subtitle: 'Maintenance as a Household Practice', tier: 'builder', section: 'preps' },
  { slug: 'dynasty-wealth', number: 15, title: 'Dynasty Wealth', subtitle: 'Financial Independence as Household Sovereignty', tier: 'builder', section: 'preps' },
  { slug: 'energy-independence', number: 16, title: 'Energy Independence', subtitle: 'Building Off the Grid, Step by Step', tier: 'steward', section: 'preps' },
  { slug: 'medical-assurance', number: 17, title: 'Medical Assurance', subtitle: 'First Responder in Your Own Home', tier: 'steward', section: 'preps' },
  { slug: 'skills-over-gear', number: 18, title: 'Skills Over Gear', subtitle: 'Why What You Know Outlasts What You Own', tier: 'builder', section: 'preps' },

  // SECTION IV — THE LONG TABLE
  { slug: 'long-table-overview', number: 19, title: 'The Long Table', subtitle: 'From Household to Civic Foundation', tier: 'builder', section: 'long-table' },
  { slug: 'two-family-standard', number: 20, title: 'The Two-Family Standard', subtitle: 'Your First Circle of Stewardship', tier: 'builder', section: 'long-table' },
  { slug: 'neighborhood-resilience', number: 21, title: 'Neighborhood Resilience', subtitle: 'The Third Ring of Preparedness', tier: 'steward', section: 'long-table' },
  { slug: 'quiet-mutual-aid', number: 22, title: 'Quiet Mutual Aid', subtitle: 'Helping Without Creating Dependency', tier: 'steward', section: 'long-table' },
  { slug: 'civic-extension', number: 23, title: 'Civic Extension', subtitle: 'Sheriff, School Board, and the Institutions That Matter', tier: 'steward', section: 'long-table' },
  { slug: 'regional-foundation', number: 24, title: 'Regional Foundation', subtitle: 'The Outermost Ring of Dynasty Impact', tier: 'steward', section: 'long-table' },
  { slug: 'trusted-list', number: 25, title: 'The Trusted List', subtitle: 'Who Earns a Seat at Your Table', tier: 'steward', section: 'long-table' },

  // SECTION V — THE VOW
  { slug: 'forging-fathers', number: 26, title: 'Forging Fathers', subtitle: 'The Legacy Protocol', tier: 'steward', section: 'vow' },
  { slug: 'dynasty-journals', number: 27, title: 'Dynasty Journals', subtitle: 'Writing for Those Who Come After', tier: 'steward', section: 'vow' },
  { slug: 'the-vow-ceremony', number: 28, title: 'The Vow', subtitle: 'A Formal Commitment to Dynastic Stewardship', tier: 'steward', section: 'vow' },
]

export const DD_SECTIONS = [
  { key: 'foundation', label: 'Foundation', description: 'The principles beneath everything' },
  { key: 'fate', label: 'The FATE Model', description: 'Food, Assurance, Tools & Skills, Energy' },
  { key: 'preps', label: 'Living Preps', description: 'From dead systems to living practice' },
  { key: 'long-table', label: 'The Long Table', description: 'Household to civic foundation' },
  { key: 'vow', label: 'The Vow', description: 'The covenant that binds it all' },
]

export function getChapterBySlug(slug: string): DDChapter | undefined {
  return DD_CHAPTERS.find(c => c.slug === slug)
}

export function getChaptersBySection(section: DDChapter['section']): DDChapter[] {
  return DD_CHAPTERS.filter(c => c.section === section)
}

export function getAdjacentChapters(slug: string): { prev: DDChapter | null; next: DDChapter | null } {
  const idx = DD_CHAPTERS.findIndex(c => c.slug === slug)
  return {
    prev: idx > 0 ? DD_CHAPTERS[idx - 1] : null,
    next: idx < DD_CHAPTERS.length - 1 ? DD_CHAPTERS[idx + 1] : null,
  }
}
