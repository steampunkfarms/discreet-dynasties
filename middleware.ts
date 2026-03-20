import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const AUTH_REQUIRED = ['/companion', '/forge', '/account', '/hall/create']
const PUBLIC_ROUTES = ['/join', '/auth']
const ADMIN_ONLY = ['/admin']
const DD_PAID_ROUTES = ['/armory', '/pathways', '/long-table']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role || ''

  if (PUBLIC_ROUTES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Must be signed in for protected routes
  if (!req.auth && AUTH_REQUIRED.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Admin only
  if (ADMIN_ONLY.some(p => pathname.startsWith(p)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Paid DD tier required for premium routes
  const paidRoles = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'full_arsenal', 'admin']
  if (DD_PAID_ROUTES.some(p => pathname.startsWith(p)) && !paidRoles.includes(role)) {
    return NextResponse.redirect(new URL('/join', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/companion/:path*',
    '/forge/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/armory/:path*',
    '/pathways/:path*',
    '/hall/:path*',
    '/long-table/:path*',
    '/join/:path*',
  ],
}
