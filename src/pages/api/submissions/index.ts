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

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const { status, taskId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (session.user.role === 'ADMIN') {
      return res.status(403).json({
        error: 'Admin không truy cập danh sách submission chi tiết. Dùng thống kê tổng hợp trong trang quản trị.',
      });
    }

    const where: any = {};

    if (session.user.role === 'CONTRIBUTOR') {
      where.contributorId = session.user.id;
    } else if (session.user.role === 'BUSINESS') {
      where.task = {
        creatorId: session.user.id,
      };
    } else {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    if (status) {
      where.status = status;
    }

    if (taskId) {
      where.taskId = taskId;
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              slug: true,
              reward: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: { submittedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.submission.count({ where }),
    ]);

    return res.json({
      success: true,
      data: submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
