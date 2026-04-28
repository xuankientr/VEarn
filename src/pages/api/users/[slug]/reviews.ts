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
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        task: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
    }));

    return res.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews: reviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
          ratingDistribution,
        },
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
