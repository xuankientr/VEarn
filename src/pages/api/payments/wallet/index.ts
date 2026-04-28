import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { isPaymentSandboxEnabled } from '@/lib/payment-gateways/sandbox';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  const role = session.user.role;

  try {
    if (role === 'CONTRIBUTOR') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { walletBalance: true },
      });

      const withdrawals = await prisma.walletWithdrawal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.json({
        success: true,
        data: {
          walletKind: 'contributor' as const,
          balance: user?.walletBalance ?? 0,
          topUps: [],
          withdrawals,
          gateways: {
            bankTransfer: false,
          },
          sandboxWithdraw: isPaymentSandboxEnabled(),
        },
      });
    }

    if (role !== 'BUSINESS') {
      return res.status(403).json({ error: 'Không có quyền xem ví' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true },
    });

    const topUps = await prisma.walletTopUp.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const withdrawals = await prisma.walletWithdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({
      success: true,
      data: {
        walletKind: 'business' as const,
        balance: user?.walletBalance ?? 0,
        topUps,
        withdrawals,
        sandboxWithdraw: isPaymentSandboxEnabled(),
        gateways: {
          bankTransfer: Boolean(
            process.env.BANK_TRANSFER_BANK_NAME &&
              process.env.BANK_TRANSFER_ACCOUNT_NO &&
              process.env.BANK_TRANSFER_ACCOUNT_NAME
          ),
        },
      },
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
