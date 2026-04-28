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

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  if (session.user.role !== 'BUSINESS') {
    return res.status(403).json({ error: 'Chỉ Business mới xem được' });
  }

  const { period = '30' } = req.query;
  const days = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const userId = session.user.id;

    // Task statistics
    const [
      totalTasks,
      openTasks,
      inProgressTasks,
      completedTasks,
      totalSpent,
      pendingPayments,
    ] = await Promise.all([
      prisma.task.count({ where: { creatorId: userId } }),
      prisma.task.count({ where: { creatorId: userId, status: 'OPEN' } }),
      prisma.task.count({ where: { creatorId: userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { creatorId: userId, status: 'APPROVED' } }),
      prisma.payment.aggregate({
        where: {
          submission: { task: { creatorId: userId } },
          status: 'PAID',
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          submission: { task: { creatorId: userId } },
          status: 'UNPAID',
        },
        _sum: { amount: true },
      }),
    ]);

    // Applications & Submissions stats
    const [totalApplications, pendingApplications, totalSubmissions, pendingSubmissions] =
      await Promise.all([
        prisma.taskApplication.count({
          where: { task: { creatorId: userId } },
        }),
        prisma.taskApplication.count({
          where: { task: { creatorId: userId }, status: 'PENDING' },
        }),
        prisma.submission.count({
          where: { task: { creatorId: userId } },
        }),
        prisma.submission.count({
          where: { task: { creatorId: userId }, status: 'PENDING' },
        }),
      ]);

    // Tasks created over time (last N days)
    const tasksOverTime = await prisma.task.groupBy({
      by: ['createdAt'],
      where: {
        creatorId: userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Group by day
    const tasksByDay: Record<string, number> = {};
    tasksOverTime.forEach((item) => {
      const day = new Date(item.createdAt).toISOString().split('T')[0];
      tasksByDay[day] = (tasksByDay[day] || 0) + item._count;
    });

    // Payments over time
    const paymentsOverTime = await prisma.payment.findMany({
      where: {
        submission: { task: { creatorId: userId } },
        status: 'PAID',
        paidAt: { gte: startDate },
      },
      select: { amount: true, paidAt: true },
    });

    const paymentsByDay: Record<string, number> = {};
    paymentsOverTime.forEach((p) => {
      if (p.paidAt) {
        const day = p.paidAt.toISOString().split('T')[0];
        paymentsByDay[day] = (paymentsByDay[day] || 0) + p.amount;
      }
    });

    // Top contributors (by completed tasks)
    const topContributors = await prisma.submission.groupBy({
      by: ['contributorId'],
      where: {
        task: { creatorId: userId },
        status: 'APPROVED',
      },
      _count: true,
      orderBy: { _count: { contributorId: 'desc' } },
      take: 5,
    });

    const contributorIds = topContributors.map((c) => c.contributorId);
    const contributors = await prisma.user.findMany({
      where: { id: { in: contributorIds } },
      select: { id: true, name: true, avatar: true },
    });

    const topContributorsWithDetails = topContributors.map((tc) => ({
      ...contributors.find((c) => c.id === tc.contributorId),
      completedTasks: tc._count,
    }));

    // Category breakdown
    const categoryStats = await prisma.task.groupBy({
      by: ['category'],
      where: { creatorId: userId },
      _count: true,
    });

    // Average rating received
    const avgRating = await prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    });

    return res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          openTasks,
          inProgressTasks,
          completedTasks,
          totalSpent: totalSpent._sum?.amount || 0,
          pendingPayments: pendingPayments._sum?.amount || 0,
          totalApplications,
          pendingApplications,
          totalSubmissions,
          pendingSubmissions,
          avgRating: avgRating._avg?.rating
            ? Math.round((avgRating._avg.rating || 0) * 10) / 10
            : null,
          reviewsCount: avgRating._count,
        },
        charts: {
          tasksByDay,
          paymentsByDay,
        },
        topContributors: topContributorsWithDetails,
        categoryStats: categoryStats.map((c) => ({
          category: c.category || 'Uncategorized',
          count: c._count,
        })),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
