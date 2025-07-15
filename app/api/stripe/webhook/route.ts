import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { cosmic } from '@/lib/cosmic'
import { CosmicUser } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!
    
    let event
    
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Update user subscription
        if (session.customer) {
          await updateUserSubscription(session.customer as string, 'Paid')
        }
        break
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object
        
        // Downgrade user to free tier
        if (subscription.customer) {
          await updateUserSubscription(subscription.customer as string, 'Free')
        }
        break
        
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function updateUserSubscription(stripeCustomerId: string, tier: string) {
  try {
    // Find user by stripe customer ID
    const users = await cosmic.objects.find({ type: 'users' }).props(['id', 'metadata'])
    const user = users.objects.find((u: CosmicUser) => u.metadata.stripe_customer_id === stripeCustomerId)
    
    if (user) {
      await cosmic.objects.updateOne(user.id, {
        metadata: {
          ...user.metadata,
          subscription_tier: tier
        }
      })
    }
  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}