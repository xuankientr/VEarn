import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'BUSINESS', 'CONTRIBUTOR']).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID không hợp lệ' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          isVerified: true,
          avatar: true,
          bio: true,
          phone: true,
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

      return res.status(200).json({ data: user });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const validation = updateUserSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.errors,
        });
      }

      const { role, isActive, isVerified } = validation.data;

      // Prevent admin from changing their own role
      if (id === session.user.id && role && role !== session.user.role) {
        return res.status(400).json({
          error: 'Không thể thay đổi role của chính mình',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(role !== undefined && { role }),
          ...(isActive !== undefined && { isActive }),
          ...(isVerified !== undefined && { isVerified }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });

      return res.status(200).json({
        message: 'Cập nhật thành công',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
