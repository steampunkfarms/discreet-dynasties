// Always return 200 to Stripe to prevent webhook suspension. Log errors internally.
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, priceIdToRole } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!.trim()
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ received: true }, { status: 200 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const tier = session.metadata?.tier

      if (userId && tier) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: tier,
            isPaid: true,
          },
        })
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      // Reset to free on cancellation
      const customerId = subscription.customer as string
      const stripeCustomer = await getStripe().customers.retrieve(customerId) as Stripe.Customer
      if (stripeCustomer.email) {
        await prisma.user.updateMany({
          where: { email: stripeCustomer.email },
          data: { role: 'free', isPaid: false },
        })
      }
    }
  } catch (err) {
    console.error('Stripe webhook business logic error:', err)
  }

  return NextResponse.json({ received: true })
}
