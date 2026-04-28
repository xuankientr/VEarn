import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, status } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID không hợp lệ' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    if (task.creatorId !== session.user.id) {
      return res.status(403).json({ error: 'Không có quyền xem submissions' });
    }

    const where: any = { taskId: id };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Get task submissions error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
