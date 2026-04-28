import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

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
      include: {
        assignees: true,
        submissions: {
          where: { contributorId: session.user.id },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    const isAssigned = task.assignees.some((a) => a.id === session.user.id);

    if (!isAssigned) {
      return res.status(400).json({ error: 'Bạn chưa nhận task này' });
    }

    // Don't allow unclaim if already submitted
    if (task.submissions.length > 0) {
      return res.status(400).json({
        error: 'Không thể hủy nhận task vì bạn đã nộp bài',
      });
    }

    // Remove from assignees
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        assignees: {
          disconnect: { id: session.user.id },
        },
        status: 'OPEN',
      },
      include: {
        assignees: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Đã hủy nhận task',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Unclaim task error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
