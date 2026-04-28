import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET — chi tiết submission (contributor: bài của mình; business: task do mình tạo).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'ID không hợp lệ' });
    return;
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            username: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            slug: true,
            reward: true,
            creatorId: true,
            creator: { select: { id: true, name: true } },
          },
        },
        payment: true,
      },
    });

    if (!submission) {
      res.status(404).json({ error: 'Không tìm thấy submission' });
      return;
    }

    const role = session.user.role;
    const uid = session.user.id;

    if (role === 'CONTRIBUTOR' && submission.contributorId !== uid) {
      res.status(403).json({ error: 'Không có quyền xem' });
      return;
    }
    if (role === 'BUSINESS' && submission.task.creatorId !== uid) {
      res.status(403).json({ error: 'Không có quyền xem' });
      return;
    }

    if (role === 'ADMIN') {
      res.status(403).json({
        error: 'Admin không xem nội dung submission của doanh nghiệp.',
      });
      return;
    }

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error('Get submission by id error:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
