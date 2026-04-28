import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // GET - List notifications
  if (req.method === 'GET') {
    try {
      const { limit = '20', unreadOnly = 'false' } = req.query;

      const notifications = await prisma.notification.findMany({
        where: {
          userId: session.user.id,
          ...(unreadOnly === 'true' ? { isRead: false } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      });

      return res.json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
