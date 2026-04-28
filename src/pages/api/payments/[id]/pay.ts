import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { notifyPaymentReceived } from '@/lib/notifications';

const paySchema = z.object({
  note: z.string().optional(),
  /** MANUAL: đánh dấu đã chuyển khoản ngoài hệ thống | WALLET: trừ ví Business */
  source: z.enum(['MANUAL', 'WALLET']).optional().default('MANUAL'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Payment ID không hợp lệ' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        submission: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Không tìm thấy payment' });
    }

    if (payment.submission.task.creatorId !== session.user.id) {
      return res.status(403).json({ error: 'Không có quyền thanh toán' });
    }

    if (payment.status === 'PAID') {
      return res.status(400).json({ error: 'Đã thanh toán rồi' });
    }

    const data = paySchema.parse(req.body);

    if (data.source === 'WALLET') {
      const business = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { walletBalance: true },
      });

      const balance = business?.walletBalance ?? 0;
      if (balance < payment.amount) {
        return res.status(400).json({
          error: 'Số dư ví không đủ',
          balance,
          required: payment.amount,
        });
      }

      const updatedPayment = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: session.user.id },
          data: { walletBalance: { decrement: payment.amount } },
        });

        await tx.user.update({
          where: { id: payment.contributorId },
          data: { walletBalance: { increment: payment.amount } },
        });

        return tx.payment.update({
          where: { id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            note: data.note ?? `Trừ ví nội bộ`,
            payChannel: 'WALLET',
          },
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
      });

      await notifyPaymentReceived(
        payment.contributorId,
        payment.amount,
        payment.submission.task.title
      );

      return res.json({
        success: true,
        message: 'Đã thanh toán từ ví',
        data: updatedPayment,
      });
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: payment.contributorId },
        data: { walletBalance: { increment: payment.amount } },
      });

      return tx.payment.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          note: data.note,
          payChannel: 'MANUAL',
        },
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    await notifyPaymentReceived(
      payment.contributorId,
      payment.amount,
      payment.submission.task.title
    );

    return res.json({
      success: true,
      message: 'Đã đánh dấu thanh toán và ghi có ví contributor',
      data: updatedPayment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    console.error('Pay error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
