import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { isPaymentSandboxEnabled } from '@/lib/payment-gateways/sandbox';

const bodySchema = z.object({
  amount: z.number().min(10_000, 'Tối thiểu 10.000đ').max(500_000_000, 'Vượt giới hạn'),
});

/**
 * Rút tiền mô phỏng (trừ ví, ghi nhận lịch sử) — chỉ khi sandbox bật.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isPaymentSandboxEnabled()) {
    res.status(403).json({
      error: 'Rút sandbox không khả dụng.',
      hint: 'Bật PAYMENT_SANDBOX=true (chỉ dev / demo có chủ đích).',
    });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  if (!['BUSINESS', 'CONTRIBUTOR'].includes(session.user.role)) {
    res.status(403).json({ error: 'Không có quyền rút ví' });
    return;
  }

  try {
    const { amount } = bodySchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true },
    });

    const balance = user?.walletBalance ?? 0;
    if (balance < amount) {
      res.status(400).json({
        error: 'Số dư không đủ',
        balance,
        required: amount,
      });
      return;
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: amount } },
      }),
      prisma.walletWithdrawal.create({
        data: {
          userId: session.user.id,
          amount,
          status: 'COMPLETED',
          completedAt: now,
          note:
            session.user.role === 'CONTRIBUTOR'
              ? 'Mô phỏng rút thu nhập (sandbox) — không chuyển khoản thật.'
              : 'Mô phỏng rút tiền (sandbox) — không chuyển khoản thật.',
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      data: {
        sandbox: true,
        message: 'Đã trừ số dư (mô phỏng — không có giao dịch thật).',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: error.errors });
      return;
    }
    console.error('withdraw-sandbox error:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
