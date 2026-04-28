import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  phone: z.string().optional().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // GET - Get current user profile
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          bio: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              createdTasks: true,
              assignedTasks: true,
              submissions: true,
              payments: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy user' });
      }

      // Get earning stats for contributors
      let earningStats = null;
      if (user.role === 'CONTRIBUTOR') {
        const [totalEarnings, paidEarnings] = await Promise.all([
          prisma.payment.aggregate({
            where: { contributorId: user.id },
            _sum: { amount: true },
          }),
          prisma.payment.aggregate({
            where: { contributorId: user.id, status: 'PAID' },
            _sum: { amount: true },
          }),
        ]);

        earningStats = {
          total: totalEarnings._sum.amount || 0,
          paid: paidEarnings._sum.amount || 0,
          pending: (totalEarnings._sum.amount || 0) - (paidEarnings._sum.amount || 0),
        };
      }

      return res.json({
        success: true,
        data: {
          ...user,
          earningStats,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // PUT - Update profile
  if (req.method === 'PUT') {
    try {
      const data = updateProfileSchema.parse(req.body);

      // Check username uniqueness
      if (data.username) {
        const existing = await prisma.user.findFirst({
          where: {
            username: data.username,
            NOT: { id: session.user.id },
          },
        });

        if (existing) {
          return res.status(409).json({ error: 'Username đã được sử dụng' });
        }
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          bio: true,
          phone: true,
          role: true,
        },
      });

      return res.json({
        success: true,
        message: 'Đã cập nhật profile',
        data: user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }

      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
