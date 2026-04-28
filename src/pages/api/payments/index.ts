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

    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (session.user.role === 'ADMIN') {
      return res.status(403).json({
        error: 'Admin không truy cập lịch sử chi trả chi tiết của doanh nghiệp.',
      });
    }

    const where: any = {};

    if (session.user.role === 'CONTRIBUTOR') {
      where.contributorId = session.user.id;
    } else if (session.user.role === 'BUSINESS') {
      where.submission = {
        task: {
          creatorId: session.user.id,
        },
      };
    } else {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    if (status) {
      where.status = status;
    }

    const [payments, total, stats] = await Promise.all([
      prisma.payment.findMany({
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
          submission: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    // Calculate stats
    const paidPayments = await prisma.payment.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { amount: true },
    });

    const unpaidPayments = await prisma.payment.aggregate({
      where: { ...where, status: 'UNPAID' },
      _sum: { amount: true },
    });

    return res.json({
      success: true,
      data: payments,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalPaid: paidPayments._sum.amount || 0,
        totalUnpaid: unpaidPayments._sum.amount || 0,
        count: stats._count._all,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
