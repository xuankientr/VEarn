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

    if (session.user.role !== 'CONTRIBUTOR') {
      return res.status(403).json({ error: 'Chỉ cộng tác viên mới có thể nhận task' });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignees: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    if (task.status !== 'OPEN') {
      return res.status(400).json({ error: 'Task không còn mở để nhận' });
    }

    // Check if already assigned
    const isAlreadyAssigned = task.assignees.some(
      (a) => a.id === session.user.id
    );

    if (isAlreadyAssigned) {
      return res.status(400).json({ error: 'Bạn đã nhận task này rồi' });
    }

    // Check max assignees
    if (task.assignees.length >= task.maxAssignees) {
      return res.status(400).json({ error: 'Task đã đủ người nhận' });
    }

    // Assign task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        assignees: {
          connect: { id: session.user.id },
        },
        status: task.assignees.length + 1 >= task.maxAssignees ? 'IN_PROGRESS' : 'OPEN',
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
      message: 'Đã nhận task thành công',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Claim task error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
