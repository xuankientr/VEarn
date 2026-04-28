import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyMomoIpnSignature } from '@/lib/payment-gateways/momo';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';

/**
 * MoMo IPN — POST JSON.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ resultCode: 1000, message: 'Method not allowed' });
  }

  const body = req.body as Record<string, unknown>;
  const secret = process.env.MOMO_SECRET_KEY;
  const skipVerify = process.env.MOMO_IPN_SKIP_VERIFY === 'true';

  if (!skipVerify && secret && !verifyMomoIpnSignature(body, secret)) {
    return res.status(400).json({ resultCode: 1001, message: 'Invalid signature' });
  }

  const resultCode = Number(body.resultCode);
  if (resultCode !== 0) {
    return res.status(200).json({ resultCode: 0, message: 'Acknowledged' });
  }

  const orderId = String(body.orderId ?? '');
  if (!orderId) {
    return res.status(200).json({ resultCode: 0, message: 'No order' });
  }

  const amount = parseFloat(String(body.amount ?? '0'));
  const done = await completeWalletTopUpIfPending({
    gatewayOrderRef: orderId,
    gatewayTransactionId: String(body.transId ?? ''),
    gatewayRaw: body as object,
    expectedAmountVnd: Number.isFinite(amount) ? amount : undefined,
  });

  if (!done.ok && done.reason !== 'invalid_status') {
    return res.status(200).json({ resultCode: 1002, message: done.reason });
  }

  return res.status(200).json({ resultCode: 0, message: 'Success' });
}
