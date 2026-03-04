export type UserRole =
  | 'free'
  | 'dd_basic'
  | 'dd_premium'
  | 'dd_dynast'
  | 'forge_bundle'
  | 'ff_basic'
  | 'ff_premium'
  | 'admin'

const DD_ROLES: UserRole[] = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin']
const DD_PREMIUM_ROLES: UserRole[] = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin']

export function canAccessDD(role: string): boolean {
  return DD_ROLES.includes(role as UserRole)
}

export function canAccessDDPremium(role: string): boolean {
  return DD_PREMIUM_ROLES.includes(role as UserRole)
}

export function isDDDynast(role: string): boolean {
  return role === 'dd_dynast' || role === 'forge_bundle' || role === 'admin'
}

export function getTierLabel(role: string): string {
  const labels: Record<string, string> = {
    free: 'Free',
    dd_basic: 'Builder',
    dd_premium: 'Steward',
    dd_dynast: 'Dynast',
    forge_bundle: 'Forge Bundle',
    ff_basic: 'Forging Fathers',
    ff_premium: 'Forging Fathers Premium',
    admin: 'Administrator',
  }
  return labels[role] || 'Free'
}

export function getTierBadgeColor(role: string): string {
  if (role === 'dd_dynast' || role === 'forge_bundle') return 'text-dynasty-amber'
  if (role === 'dd_premium') return 'text-dynasty-amber-light'
  if (role === 'dd_basic') return 'text-dynasty-walnut-light'
  return 'text-dynasty-ink-muted'
}
