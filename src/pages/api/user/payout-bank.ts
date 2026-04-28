import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

const updateSchema = z.object({
  payoutBankBin: z.string().regex(/^\d{5,8}$/, 'Mã BIN không hợp lệ'),
  payoutBankCode: z.string().min(2).max(32),
  payoutBankName: z.string().min(2).max(200),
  payoutAccountNo: z.string().min(4).max(32).regex(/^[\dA-Za-z]+$/, 'Số TK chỉ gồm chữ số/chữ'),
  payoutAccountName: z.string().min(2).max(120),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  if (session.user.role !== 'CONTRIBUTOR') {
    res.status(403).json({ error: 'Chỉ dành cho Contributor' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          payoutBankBin: true,
          payoutBankCode: true,
          payoutBankName: true,
          payoutAccountNo: true,
          payoutAccountName: true,
        },
      });
      res.status(200).json({ success: true, data: user });
    } catch (e) {
      console.error('payout-bank GET:', e);
      res.status(500).json({ error: 'Lỗi server' });
    }
    return;
  }

  if (req.method === 'PUT') {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.errors });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: parsed.data,
        select: {
          payoutBankBin: true,
          payoutBankCode: true,
          payoutBankName: true,
          payoutAccountNo: true,
          payoutAccountName: true,
        },
      });

      res.status(200).json({ success: true, message: 'Đã lưu', data: updated });
    } catch (e) {
      console.error('payout-bank PUT:', e);
      res.status(500).json({ error: 'Lỗi server' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
