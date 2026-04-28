import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  requirements: z.string().optional().nullable(),
  reward: z.number().positive().optional().nullable(),
  maxAssignees: z.number().int().positive().optional(),
  category: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Template ID không hợp lệ' });
  }

  const session = await getServerSession(req, res, authOptions);

  // GET - Get template
  if (req.method === 'GET') {
    try {
      const template = await prisma.taskTemplate.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, name: true },
          },
        },
      });

      if (!template) {
        return res.status(404).json({ error: 'Không tìm thấy template' });
      }

      return res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error('Get template error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // PUT - Update template
  if (req.method === 'PUT') {
    try {
      const template = await prisma.taskTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        return res.status(404).json({ error: 'Không tìm thấy template' });
      }

      if (template.isSystem) {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Chỉ quản trị sửa template hệ thống' });
        }
      } else if (template.creatorId !== session.user.id) {
        return res.status(403).json({ error: 'Không có quyền chỉnh sửa' });
      }

      const data = updateTemplateSchema.parse(req.body);

      const updatedTemplate = await prisma.taskTemplate.update({
        where: { id },
        data,
      });

      return res.json({
        success: true,
        data: updatedTemplate,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }
      console.error('Update template error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // DELETE - Delete template
  if (req.method === 'DELETE') {
    try {
      const template = await prisma.taskTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        return res.status(404).json({ error: 'Không tìm thấy template' });
      }

      if (template.isSystem) {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Chỉ quản trị xóa template hệ thống' });
        }
      } else if (template.creatorId !== session.user.id) {
        return res.status(403).json({ error: 'Không có quyền xóa' });
      }

      await prisma.taskTemplate.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Đã xóa template',
      });
    } catch (error) {
      console.error('Delete template error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
