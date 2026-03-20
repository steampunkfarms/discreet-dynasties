import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getStripe, getOrCreateStripeCustomer, PRICE_IDS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  const formData = await req.formData()
  const tier = formData.get('tier') as string

  const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const stripe = getStripe()
  const customerId = await getOrCreateStripeCustomer(session.user.email, session.user.name || undefined)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreet.tronboll.us'

  const isLifetime = tier === 'dd_dynast' || tier === 'forge_bundle'

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isLifetime ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/forge?checkout=success`,
    cancel_url: `${siteUrl}/join`,
    metadata: {
      userId: session.user.id,
      tier,
    },
  })

  return NextResponse.redirect(checkoutSession.url!, 303)
}
