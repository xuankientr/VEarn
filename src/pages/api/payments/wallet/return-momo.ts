import type { NextApiRequest, NextApiResponse } from 'next';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';
import { getPublicAppUrl } from '@/lib/payment-gateways/app-url';
import { flattenQuery } from '@/lib/payment-gateways/flatten-query';

/**
 * Return URL sau thanh toán MoMo (GET). IPN vẫn là nguồn chính; đây để UX nhanh.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const q = flattenQuery(req.query);
  const resultCode = parseInt(q.resultCode ?? '999', 10);
  const orderId = q.orderId;

  if (resultCode !== 0 || !orderId) {
    return res.redirect(
      302,
      `${getPublicAppUrl()}/dashboard/wallet?topup=error&reason=momo_${resultCode}`
    );
  }

  const amount = parseFloat(q.amount || '0');
  const done = await completeWalletTopUpIfPending({
    gatewayOrderRef: orderId,
    gatewayTransactionId: q.transId,
    gatewayRaw: q,
    expectedAmountVnd: Number.isFinite(amount) ? amount : undefined,
  });

  if (!done.ok) {
    return res.redirect(
      302,
      `${getPublicAppUrl()}/dashboard/wallet?topup=pending`
    );
  }

  return res.redirect(302, `${getPublicAppUrl()}/dashboard/wallet?topup=success`);
}
