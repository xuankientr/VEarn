import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { completeWalletTopUpIfPending } from '@/lib/payment-gateways/complete-topup';

/**
 * Admin xác nhận đã nhận tiền CK ngân hàng — cộng ví.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ Admin' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  try {
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id },
    });

    if (!topUp) {
      return res.status(404).json({ error: 'Không tìm thấy' });
    }

    if (topUp.method !== 'BANK_TRANSFER' || topUp.status !== 'AWAITING_CONFIRMATION') {
      return res.status(400).json({ error: 'Giao dịch không ở trạng thái chờ CK' });
    }

    if (!topUp.gatewayOrderRef) {
      return res.status(400).json({ error: 'Thiếu mã tham chiếu' });
    }

    const done = await completeWalletTopUpIfPending({
      gatewayOrderRef: topUp.gatewayOrderRef,
      gatewayTransactionId: `bank_admin_${session.user.id}`,
      gatewayRaw: { confirmedBy: session.user.id, at: new Date().toISOString() },
    });

    if (!done.ok) {
      return res.status(400).json({ error: done.reason });
    }

    return res.json({ success: true, message: 'Đã cộng ví' });
  } catch (error) {
    console.error('Confirm topup error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
