import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyVnpayCallback } from '@/lib/payment-gateways/vnpay';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';
import { flattenQuery } from '@/lib/payment-gateways/flatten-query';

/**
 * VNPay IPN (server-to-server). Phải trả JSON theo spec VNPay.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ RspCode: '99', Message: 'Unknown error' });
  }

  const secret = process.env.VNPAY_HASH_SECRET;
  if (!secret) {
    return res.status(200).json({ RspCode: '99', Message: 'Server config' });
  }

  const raw =
    req.method === 'POST' && req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? (req.body as Record<string, string | string[] | undefined>)
      : req.query;

  const flat = flattenQuery(raw);

  const verified = verifyVnpayCallback(flat, secret);

  if (!verified.ok) {
    return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
  }

  const done = await completeWalletTopUpIfPending({
    gatewayOrderRef: verified.txnRef,
    gatewayTransactionId: verified.transactionNo,
    gatewayRaw: flat,
    expectedAmountVnd: verified.amountVnd,
  });

  if (!done.ok && done.reason !== 'invalid_status') {
    return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
  }

  return res.status(200).json({ RspCode: '00', Message: 'confirm success' });
}
