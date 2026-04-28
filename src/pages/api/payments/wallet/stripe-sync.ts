import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import {
  getStripe,
  isStripeConfigured,
} from '@/lib/payment-gateways/stripe';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';

const bodySchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * Đồng bộ sau khi redirect từ Stripe Checkout (bổ sung cho webhook — idempotent).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Stripe chưa cấu hình' });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  if (session.user.role !== 'BUSINESS') {
    res.status(403).json({ error: 'Chỉ Business' });
    return;
  }

  try {
    const { sessionId } = bodySchema.parse(req.body);
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      res.status(400).json({ error: 'Giao dịch chưa thanh toán hoặc đang xử lý' });
      return;
    }

    const ref = checkoutSession.client_reference_id;
    if (!ref) {
      res.status(400).json({ error: 'Thiếu mã tham chiếu giao dịch' });
      return;
    }

    const topUp = await prisma.walletTopUp.findUnique({
      where: { gatewayOrderRef: ref },
    });

    if (!topUp || topUp.userId !== session.user.id || topUp.method !== 'STRIPE') {
      res.status(403).json({ error: 'Không khớp giao dịch' });
      return;
    }

    const amountTotal = checkoutSession.amount_total;
    if (amountTotal == null) {
      res.status(400).json({ error: 'Thiếu số tiền từ Stripe' });
      return;
    }

    const paymentIntentId =
      typeof checkoutSession.payment_intent === 'string'
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id;

    const done = await completeWalletTopUpIfPending({
      gatewayOrderRef: ref,
      gatewayTransactionId: paymentIntentId ?? checkoutSession.id,
      gatewayRaw: {
        stripeSessionId: sessionId,
        paymentStatus: checkoutSession.payment_status,
      },
      expectedAmountVnd: amountTotal,
    });

    if (!done.ok) {
      res.status(400).json({
        error: 'Không hoàn tất nạp ví',
        detail: done.reason,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        alreadyDone: done.ok && 'alreadyDone' in done ? done.alreadyDone : false,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: error.errors });
      return;
    }
    console.error('stripe-sync error:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
