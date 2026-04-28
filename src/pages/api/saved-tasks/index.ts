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

  // GET - List saved tasks
  if (req.method === 'GET') {
    try {
      const savedTasks = await prisma.savedTask.findMany({
        where: { userId: session.user.id },
        include: {
          task: {
            include: {
              creator: {
                select: { id: true, name: true, avatar: true },
              },
              _count: {
                select: { assignees: true, submissions: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: savedTasks.map((st) => ({
          ...st.task,
          savedAt: st.createdAt,
        })),
      });
    } catch (error) {
      console.error('Get saved tasks error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // POST - Save a task
  if (req.method === 'POST') {
    try {
      const { taskId } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const task = await prisma.task.findUnique({ where: { id: taskId } });

      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      const existing = await prisma.savedTask.findUnique({
        where: {
          userId_taskId: {
            userId: session.user.id,
            taskId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Đã lưu task này rồi' });
      }

      await prisma.savedTask.create({
        data: {
          userId: session.user.id,
          taskId,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Đã lưu task',
      });
    } catch (error) {
      console.error('Save task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
