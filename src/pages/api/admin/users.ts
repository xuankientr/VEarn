import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
  }

  // GET - List users
  if (req.method === 'GET') {
    try {
      const { role, search, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            isVerified: true,
            avatar: true,
            createdAt: true,
            _count: {
              select: {
                createdTasks: true,
                submissions: true,
                payments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.user.count({ where }),
      ]);

      return res.json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
