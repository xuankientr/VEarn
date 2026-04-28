import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ Admin' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status } = req.query;

  try {
    const where =
      status === 'AWAITING_CONFIRMATION'
        ? { status: 'AWAITING_CONFIRMATION' as const }
        : {};

    const items = await prisma.walletTopUp.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Admin wallet topups list error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
