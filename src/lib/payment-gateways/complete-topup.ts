import { prisma } from '@/prisma';
import type { Prisma } from '@prisma/client';

/**
 * Hoàn tất nạp ví (idempotent — gọi nhiều lần an toàn).
 */
export const completeWalletTopUpIfPending = async (params: {
  gatewayOrderRef: string;
  gatewayTransactionId?: string;
  gatewayRaw?: Prisma.JsonValue;
  /** So khớp số tiền từ cổng (VND) — chống chỉnh amount trên URL */
  expectedAmountVnd?: number;
}): Promise<{ ok: true; alreadyDone?: boolean } | { ok: false; reason: string }> => {
  const topUp = await prisma.walletTopUp.findUnique({
    where: { gatewayOrderRef: params.gatewayOrderRef },
  });

  if (!topUp) {
    return { ok: false, reason: 'not_found' };
  }

  if (topUp.status === 'COMPLETED') {
    return { ok: true, alreadyDone: true };
  }

  if (topUp.method === 'BANK_TRANSFER') {
    if (topUp.status !== 'AWAITING_CONFIRMATION') {
      return { ok: false, reason: 'invalid_status' };
    }
  } else if (topUp.status !== 'PENDING' && topUp.status !== 'PROCESSING') {
    return { ok: false, reason: 'invalid_status' };
  }

  if (
    params.expectedAmountVnd !== undefined &&
    Math.abs(topUp.amount - params.expectedAmountVnd) > 1
  ) {
    return { ok: false, reason: 'amount_mismatch' };
  }

  await prisma.$transaction([
    prisma.walletTopUp.update({
      where: { id: topUp.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        gatewayTransactionId: params.gatewayTransactionId ?? undefined,
        gatewayRaw: params.gatewayRaw ?? undefined,
      },
    }),
    prisma.user.update({
      where: { id: topUp.userId },
      data: { walletBalance: { increment: topUp.amount } },
    }),
  ]);

  return { ok: true };
};
