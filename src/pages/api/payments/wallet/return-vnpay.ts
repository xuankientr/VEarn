import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyVnpayCallback } from '@/lib/payment-gateways/vnpay';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';
import { getPublicAppUrl } from '@/lib/payment-gateways/app-url';
import { flattenQuery } from '@/lib/payment-gateways/flatten-query';

/**
 * Return URL sau khi user thanh toán trên VNPay (GET).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const secret = process.env.VNPAY_HASH_SECRET;
  if (!secret) {
    return res.redirect(302, `${getPublicAppUrl()}/dashboard/wallet?topup=error&reason=config`);
  }

  const query = flattenQuery(req.query);
  const verified = verifyVnpayCallback(query, secret);

  if (!verified.ok) {
    return res.redirect(
      302,
      `${getPublicAppUrl()}/dashboard/wallet?topup=error&reason=${encodeURIComponent(verified.reason)}`
    );
  }

  const done = await completeWalletTopUpIfPending({
    gatewayOrderRef: verified.txnRef,
    gatewayTransactionId: verified.transactionNo,
    gatewayRaw: query,
    expectedAmountVnd: verified.amountVnd,
  });

  if (!done.ok) {
    return res.redirect(
      302,
      `${getPublicAppUrl()}/dashboard/wallet?topup=error&reason=${encodeURIComponent(done.reason)}`
    );
  }

  return res.redirect(302, `${getPublicAppUrl()}/dashboard/wallet?topup=success`);
}
