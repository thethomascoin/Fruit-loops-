import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, tierId, successUrl, cancelUrl } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId parameter' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectSuccess = successUrl || `${appUrl}?payment=success&tier=${tierId || 'pro'}`;
    const redirectCancel = cancelUrl || `${appUrl}?payment=cancelled`;

    // Check price details from Stripe to determine mode (subscription vs payment)
    let mode: 'subscription' | 'payment' = 'subscription';
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.recurring) {
        mode = 'payment';
      }
    } catch {
      // Fallback mode logic
      if (tierId === 'expansion') {
        mode = 'payment';
      }
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: redirectSuccess,
      cancel_url: redirectCancel,
      metadata: {
        tierId: tierId || 'pro',
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create Stripe Checkout session';
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
