import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // POST - Mark as read
  if (req.method === 'POST') {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Không tìm thấy notification' });
      }

      if (notification.userId !== session.user.id) {
        return res.status(403).json({ error: 'Không có quyền' });
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return res.json({
        success: true,
        message: 'Đã đánh dấu là đã đọc',
      });
    } catch (error) {
      console.error('Mark read error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // DELETE - Delete notification
  if (req.method === 'DELETE') {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Không tìm thấy notification' });
      }

      if (notification.userId !== session.user.id) {
        return res.status(403).json({ error: 'Không có quyền' });
      }

      await prisma.notification.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Đã xóa notification',
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
