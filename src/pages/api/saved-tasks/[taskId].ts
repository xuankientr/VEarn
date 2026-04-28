import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { taskId } = req.query;

  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'Task ID không hợp lệ' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // GET - Check if task is saved
  if (req.method === 'GET') {
    try {
      const saved = await prisma.savedTask.findUnique({
        where: {
          userId_taskId: {
            userId: session.user.id,
            taskId,
          },
        },
      });

      return res.json({
        success: true,
        data: { isSaved: !!saved },
      });
    } catch (error) {
      console.error('Check saved task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // DELETE - Unsave a task
  if (req.method === 'DELETE') {
    try {
      const saved = await prisma.savedTask.findUnique({
        where: {
          userId_taskId: {
            userId: session.user.id,
            taskId,
          },
        },
      });

      if (!saved) {
        return res.status(404).json({ error: 'Chưa lưu task này' });
      }

      await prisma.savedTask.delete({
        where: {
          userId_taskId: {
            userId: session.user.id,
            taskId,
          },
        },
      });

      return res.json({
        success: true,
        message: 'Đã bỏ lưu task',
      });
    } catch (error) {
      console.error('Unsave task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
