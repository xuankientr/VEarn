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

    const { status } = req.query;

    const where: any = {
      contributorId: session.user.id,
    };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            slug: true,
            reward: true,
            deadline: true,
            category: true,
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
