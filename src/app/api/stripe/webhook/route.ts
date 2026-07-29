import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') || '';

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: any;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle relevant events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log(`Payment Succeeded for Session: ${session.id}`, session.metadata);
      // In production, sync customer entitlement with database (Supabase, Firebase, Postgres, etc.)
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log(`Subscription Status Changed: ${subscription.id} -> ${subscription.status}`);
      break;
    }
    default:
      console.log(`Unhandled Stripe Event Type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
