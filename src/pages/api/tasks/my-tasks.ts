import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  if (!['BUSINESS', 'ADMIN'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }

  try {
    const { status } = req.query;

    const where: any = {};

    if (session.user.role !== 'ADMIN') {
      where.creatorId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            assignees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
