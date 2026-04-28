import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';
import { z } from 'zod';

const updateCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Nội dung không được để trống')
    .max(5000, 'Bình luận tối đa 5000 ký tự'),
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
  const { id, commentId } = req.query;

  if (typeof id !== 'string' || typeof commentId !== 'string') {
    return res.status(400).json({ error: 'Tham số không hợp lệ' });
  }

  const task = await findTaskByIdOrSlug(id);

  if (!task) {
    return res.status(404).json({ error: 'Task không tồn tại' });
  }

  const canonicalTaskId = task.id;

  const comment = await prisma.taskComment.findFirst({
    where: {
      id: commentId,
      taskId: canonicalTaskId,
    },
  });

  if (!comment) {
    return res.status(404).json({ error: 'Không tìm thấy bình luận' });
  }

  if (req.method === 'PATCH') {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    if (comment.userId !== session.user.id) {
      return res.status(403).json({ error: 'Chỉ tác giả mới được sửa' });
    }

    try {
      const parsed = updateCommentSchema.parse(req.body);

      const updated = await prisma.taskComment.update({
        where: { id: comment.id },
        data: { body: parsed.body },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const first = error.errors[0];
        return res.status(400).json({
          error: first?.message ?? 'Dữ liệu không hợp lệ',
        });
      }
      console.error('Update task comment error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const isAuthor = comment.userId === session.user.id;
    const isTaskOwner = session.user.id === task.creatorId;

    if (!isAuthor && !isTaskOwner) {
      return res.status(403).json({ error: 'Không có quyền xóa' });
    }

    try {
      await prisma.taskComment.delete({
        where: { id: comment.id },
      });

      return res.status(200).json({ success: true, message: 'Đã xóa' });
    } catch (error) {
      console.error('Delete task comment error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
