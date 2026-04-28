import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const coverImageUrlUpdate = z.preprocess((raw: unknown) => {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t === '' ? null : t;
  }
  return raw;
}, z.union([z.string().max(2048), z.null()]).optional()).refine(
  (v) =>
    v === undefined ||
    v === null ||
    v.startsWith('/') ||
    /^https?:\/\//i.test(v),
  { message: 'URL ảnh phải bắt đầu bằng / hoặc http(s)://' }
);

const updateTaskSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  requirements: z.string().optional(),
  reward: z.number().positive().optional(),
  deadline: z.string().optional(),
  maxAssignees: z.number().int().positive().optional(),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  coverImageUrl: coverImageUrlUpdate,
});

async function findTaskByIdOrSlug(idOrSlug: string) {
  return prisma.task.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID không hợp lệ' });
  }

  // GET - Get task details
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session?.user?.id;
      const userRole = session?.user?.role;

      const task = await prisma.task.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              avatar: true,
              bio: true,
              company: true,
              website: true,
              location: true,
            },
          },
          assignees: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              submissions: true,
              assignees: true,
            },
          },
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy task' });
      }

      const isCreator = userId === task.creatorId;
      const canViewAllSubmissions = isCreator;

      let submissions: any[] = [];

      if (canViewAllSubmissions) {
        submissions = await prisma.submission.findMany({
          where: { taskId: task.id },
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        });
      } else if (userId) {
        submissions = await prisma.submission.findMany({
          where: {
            taskId: task.id,
            contributorId: userId,
          },
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        });
      }

      return res.json({
        success: true,
        data: {
          ...task,
          submissions,
        },
      });
    } catch (error) {
      console.error('Get task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // PUT - Update task (supports both id and slug)
  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
      }

      const task = await findTaskByIdOrSlug(id);

      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy task' });
      }

      if (task.creatorId !== session.user.id) {
        return res.status(403).json({ error: 'Không có quyền chỉnh sửa' });
      }

      const data = updateTaskSchema.parse(req.body);

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: {
          ...data,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return res.json({ success: true, data: updatedTask });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }

      console.error('Update task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // DELETE - Delete task (supports both id and slug)
  if (req.method === 'DELETE') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
      }

      const task = await findTaskByIdOrSlug(id);

      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy task' });
      }

      if (task.creatorId !== session.user.id) {
        return res.status(403).json({ error: 'Không có quyền xóa' });
      }

      await prisma.task.delete({ where: { id: task.id } });

      return res.json({ success: true, message: 'Đã xóa task' });
    } catch (error) {
      console.error('Delete task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
