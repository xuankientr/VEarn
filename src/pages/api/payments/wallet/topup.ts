import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { buildVietQrImageUrl } from '@/lib/payment-gateways/vietqr-image-url';

const topUpSchema = z.object({
  amount: z.number().min(10_000, 'Tối thiểu 10.000đ').max(500_000_000, 'Vượt giới hạn'),
  /** Nạp ví chỉ qua chuyển khoản thủ công + VietQR (Stripe/VNPay/MoMo không dùng trên luồng này). */
  method: z.literal('BANK_TRANSFER'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  if (session.user.role !== 'BUSINESS') {
    return res.status(403).json({ error: 'Chỉ Business mới nạp ví' });
  }

  try {
    const body = topUpSchema.parse(req.body);

    const bankName = process.env.BANK_TRANSFER_BANK_NAME;
    const accountNo = process.env.BANK_TRANSFER_ACCOUNT_NO;
    const accountName = process.env.BANK_TRANSFER_ACCOUNT_NAME;

    if (!bankName || !accountNo || !accountName) {
      return res.status(503).json({
        error: 'Chưa cấu hình thông tin chuyển khoản',
        hint: 'Thêm BANK_TRANSFER_BANK_NAME, BANK_TRANSFER_ACCOUNT_NO, BANK_TRANSFER_ACCOUNT_NAME',
      });
    }

    const gatewayOrderRef = crypto.randomUUID();

    const topUp = await prisma.walletTopUp.create({
      data: {
        userId: session.user.id,
        amount: body.amount,
        method: 'BANK_TRANSFER',
        status: 'AWAITING_CONFIRMATION',
        gatewayOrderRef,
      },
    });

    /** Nội dung CK + VietQR: không dấu gạch, chỉ chữ số/chữ (giới hạn VietQR). */
    const transferContent = `VEARN${topUp.id.replace(/-/g, '')}`;

    const bankNote = [
      `Số tiền: ${new Intl.NumberFormat('vi-VN').format(body.amount)}đ`,
      `Ngân hàng: ${bankName}`,
      `Số tài khoản: ${accountNo}`,
      `Chủ TK: ${accountName}`,
      `Nội dung CK (bắt buộc): ${transferContent}`,
    ].join('\n');

    await prisma.walletTopUp.update({
      where: { id: topUp.id },
      data: { bankTransferNote: bankNote },
    });

    const vietQrBin = process.env.BANK_TRANSFER_VIETQR_BIN?.trim();
    const vietQrImageUrl =
      vietQrBin && vietQrBin.length > 0
        ? buildVietQrImageUrl({
            bankId: vietQrBin,
            accountNo,
            amount: body.amount,
            addInfo: transferContent,
            accountName,
          })
        : undefined;

    return res.status(201).json({
      success: true,
      data: {
        topUpId: topUp.id,
        method: 'BANK_TRANSFER',
        instructions: {
          bankName,
          accountNo,
          accountName,
          amount: body.amount,
          transferContent,
          note: 'Admin sẽ xác nhận sau khi nhận được tiền.',
          ...(vietQrImageUrl ? { vietQrImageUrl } : {}),
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: error.errors });
    }
    console.error('Topup error:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('TopUpMethod') || msg.includes('22P02')) {
      return res.status(503).json({
        error: 'Database chưa đồng bộ với schema (thiếu phương thức nạp mới).',
        hint: 'Chạy: pnpm exec prisma db push',
      });
    }
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
