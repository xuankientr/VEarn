import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(3, 'Tên template phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  requirements: z.string().optional(),
  reward: z.number().positive().optional(),
  maxAssignees: z.number().int().positive().default(1),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // GET - List templates (system + user's own)
  if (req.method === 'GET') {
    try {
      const where: any = {
        OR: [{ isSystem: true }],
      };

      // Include user's own templates if logged in
      if (session?.user?.id) {
        where.OR.push({ creatorId: session.user.id });
      }

      const templates = await prisma.taskTemplate.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
      });

      return res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error('Get templates error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // POST - Create template
  if (req.method === 'POST') {
    if (!session?.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    if (!['BUSINESS', 'ADMIN'].includes(session.user.role)) {
      return res.status(403).json({ error: 'Không có quyền tạo template' });
    }

    try {
      const data = createTemplateSchema.parse(req.body);

      const template = await prisma.taskTemplate.create({
        data: {
          ...data,
          creatorId: session.user.id,
        },
      });

      return res.status(201).json({
        success: true,
        data: template,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }
      console.error('Create template error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
