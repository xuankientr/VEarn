import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Tham số không hợp lệ' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: slug }, { username: slug }],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        skills: true,
        portfolioLinks: true,
        website: true,
        location: true,
        company: true,
        socialLinks: true,
        hourlyRate: true,
        availability: true,
        _count: {
          select: {
            createdTasks: true,
            submissions: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const [completedTasks, approvedSubmissions, totalEarnings, avgRating] = await Promise.all([
      user.role === 'BUSINESS'
        ? prisma.task.count({
            where: { creatorId: user.id, status: 'APPROVED' },
          })
        : 0,
      user.role === 'CONTRIBUTOR'
        ? prisma.submission.count({
            where: { contributorId: user.id, status: 'APPROVED' },
          })
        : 0,
      user.role === 'CONTRIBUTOR'
        ? prisma.payment.aggregate({
            where: { contributorId: user.id, status: 'PAID' },
            _sum: { amount: true },
          })
        : { _sum: { amount: null } },
      prisma.review.aggregate({
        where: { revieweeId: user.id },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        ...user,
        stats: {
          tasksCreated: user._count.createdTasks,
          submissionsCount: user._count.submissions,
          completedTasks: user.role === 'BUSINESS' ? completedTasks : approvedSubmissions,
          totalEarnings: totalEarnings._sum?.amount || 0,
          rating: avgRating._avg?.rating
            ? Math.round((avgRating._avg.rating || 0) * 10) / 10
            : null,
          reviewsCount: avgRating._count,
        },
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
