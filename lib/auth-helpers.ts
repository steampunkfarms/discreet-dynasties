export type UserRole =
  | 'free'
  | 'stoic_basic'
  | 'stoic_premium'
  | 'dd_basic'
  | 'dd_premium'
  | 'dd_dynast'
  | 'ff_basic'
  | 'ff_premium'
  | 'ff_patriarch'
  | 'forge_bundle'
  | 'full_arsenal'
  | 'admin'

const DD_ROLES: UserRole[] = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'full_arsenal', 'admin']
const DD_PREMIUM_ROLES: UserRole[] = ['dd_premium', 'dd_dynast', 'forge_bundle', 'full_arsenal', 'admin']

export function canAccessDD(role: string): boolean {
  return DD_ROLES.includes(role as UserRole)
}

export function canAccessDDPremium(role: string): boolean {
  return DD_PREMIUM_ROLES.includes(role as UserRole)
}

export function isDDDynast(role: string): boolean {
  return role === 'dd_dynast' || role === 'forge_bundle' || role === 'full_arsenal' || role === 'admin'
}

export function getTierLabel(role: string): string {
  const labels: Record<string, string> = {
    free: 'Free',
    stoic_basic: 'The Forge Monthly',
    stoic_premium: 'The Forge Annual',
    dd_basic: 'Builder',
    dd_premium: 'Steward',
    dd_dynast: 'Dynast',
    forge_bundle: 'Forge Bundle',
    ff_basic: 'Forging Fathers',
    ff_premium: 'Forging Fathers Annual',
    ff_patriarch: 'Patriarch',
    full_arsenal: 'Full Arsenal',
    admin: 'Administrator',
  }
  return labels[role] || 'Free'
}

export function getTierBadgeColor(role: string): string {
  if (role === 'dd_dynast' || role === 'forge_bundle' || role === 'full_arsenal') return 'text-dynasty-amber'
  if (role === 'dd_premium') return 'text-dynasty-amber-light'
  if (role === 'dd_basic') return 'text-dynasty-walnut-light'
  return 'text-dynasty-ink-muted'
}
