import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import { prisma } from '@/prisma';
import { getStripe } from '@/lib/payment-gateways/stripe';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Webhook Stripe — bắt buộc cho production; local dùng `stripe listen --forward-to`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET missing');
    res.status(503).json({ error: 'Webhook chưa cấu hình' });
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  if (typeof sig !== 'string') {
    res.status(400).json({ error: 'Missing stripe-signature' });
    return;
  }

  const stripe = getStripe();
  let event: ReturnType<(typeof stripe)['webhooks']['constructEvent']>;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const checkoutSession = event.data.object as {
        readonly payment_status?: string;
        readonly client_reference_id?: string | null;
        readonly amount_total?: number | null;
        readonly payment_intent?: string | { readonly id: string } | null;
        readonly id: string;
      };

      if (checkoutSession.payment_status !== 'paid') {
        res.status(200).json({ received: true, skipped: 'not_paid' });
        return;
      }

      const ref = checkoutSession.client_reference_id;
      if (!ref) {
        res.status(200).json({ received: true, skipped: 'no_ref' });
        return;
      }

      const topUp = await prisma.walletTopUp.findUnique({
        where: { gatewayOrderRef: ref },
      });

      if (!topUp || topUp.method !== 'STRIPE') {
        res.status(200).json({ received: true, skipped: 'unknown_topup' });
        return;
      }

      const amountTotal = checkoutSession.amount_total;
      if (amountTotal == null) {
        res.status(200).json({ received: true, skipped: 'no_amount' });
        return;
      }

      const paymentIntentId =
        typeof checkoutSession.payment_intent === 'string'
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id;

      await completeWalletTopUpIfPending({
        gatewayOrderRef: ref,
        gatewayTransactionId: paymentIntentId ?? checkoutSession.id,
        gatewayRaw: {
          stripeEventId: event.id,
          checkoutSessionId: checkoutSession.id,
        },
        expectedAmountVnd: amountTotal,
      });
    }

    res.status(200).json({ received: true });
  } catch (e) {
    console.error('Stripe webhook handler:', e);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
