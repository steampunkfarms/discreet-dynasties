import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getStripe, PRICE_IDS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  const formData = await req.formData()
  const tier = formData.get('tier') as string

  const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const stripe = getStripe()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreet.tronboll.us'

  // Determine mode based on tier
  const isLifetime = tier === 'dd_dynast' || tier === 'forge_bundle'

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: isLifetime ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/forge?checkout=success`,
    cancel_url: `${siteUrl}/join`,
    customer_email: session.user.email || undefined,
    metadata: {
      userId: session.user.id,
      tier,
    },
  })

  return NextResponse.redirect(checkoutSession.url!, 303)
}
