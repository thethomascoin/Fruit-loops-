import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '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', {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'FL Studio Web Clone',
    version: '1.0.0',
  },
});
