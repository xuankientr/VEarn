import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  try {
    const { status } = req.query;

    const where: any = {
      applicantId: session.user.id,
    };

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      where.status = status;
    }

    const applications = await prisma.taskApplication.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            slug: true,
            reward: true,
            deadline: true,
            status: true,
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
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
