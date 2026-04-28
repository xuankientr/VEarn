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

    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
    }

    // Get all stats in parallel
    const [
      totalUsers,
      activeUsers,
      totalAdmins,
      totalBusinesses,
      totalContributors,
      totalTasks,
      draftTasks,
      openTasks,
      inProgressTasks,
      completedTasks,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalPayments,
      paidPayments,
      unpaidPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'BUSINESS' } }),
      prisma.user.count({ where: { role: 'CONTRIBUTOR' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'DRAFT' } }),
      prisma.task.count({ where: { status: 'OPEN' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { status: 'APPROVED' } }),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: 'PENDING' } }),
      prisma.submission.count({ where: { status: 'APPROVED' } }),
      prisma.submission.count({ where: { status: 'REJECTED' } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: 'UNPAID' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: totalAdmins,
          business: totalBusinesses,
          contributors: totalContributors,
        },
        tasks: {
          total: totalTasks,
          draft: draftTasks,
          open: openTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
        },
        submissions: {
          total: totalSubmissions,
          pending: pendingSubmissions,
          approved: approvedSubmissions,
          rejected: rejectedSubmissions,
        },
        payments: {
          totalAmount: totalPayments._sum.amount || 0,
          paidAmount: paidPayments._sum.amount || 0,
          pendingAmount: unpaidPayments._sum.amount || 0,
          paid: paidPayments._count || 0,
          unpaid: unpaidPayments._count || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
