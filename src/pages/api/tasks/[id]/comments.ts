import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';
import { notifyTaskCommentParticipants } from '@/lib/notifications';
import { z } from 'zod';

/** Hàng cha khi tạo trả lời (sau `prisma generate` khớp với TaskComment). */
interface TaskCommentParentRow {
  readonly id: string;
  readonly parentId: string | null;
}

const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Nội dung không được để trống')
    .max(5000, 'Bình luận tối đa 5000 ký tự'),
  /** Trả lời bình luận gốc (một cấp). */
  parentId: z.string().uuid().optional(),
});

async function findTaskByIdOrSlug(idOrSlug: string) {
  return prisma.task.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}

/** Task cho phép đăng bình luận mới (không nháp / không đóng). */
function taskAcceptsNewComments(task: {
  isPublished: boolean;
  status: string;
}): boolean {
  if (!task.isPublished) return false;
  if (task.status === 'DRAFT' || task.status === 'CLOSED') return false;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const task = await findTaskByIdOrSlug(id);

  if (!task) {
    return res.status(404).json({ error: 'Task không tồn tại' });
  }

  const canonicalTaskId = task.id;

  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const viewerId = session?.user?.id;
      const viewerRole = session?.user?.role;
      const isCreatorOrAdmin =
        viewerId != null && viewerId === task.creatorId;

      const isHiddenFromPublic =
        !task.isPublished || task.status === 'DRAFT';

      if (isHiddenFromPublic && !isCreatorOrAdmin) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const comments = await prisma.taskComment.findMany({
        where: { taskId: canonicalTaskId },
        orderBy: { createdAt: 'asc' },
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

      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error('List task comments error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    if (!taskAcceptsNewComments(task)) {
      return res.status(403).json({
        error: 'Task này không mở bình luận',
      });
    }

    try {
      const parsed = createCommentSchema.parse(req.body);

      let parentId: string | undefined;

      if (parsed.parentId) {
        const parent = (await prisma.taskComment.findFirst({
          where: {
            id: parsed.parentId,
            taskId: canonicalTaskId,
          },
        })) as TaskCommentParentRow | null;

        if (!parent) {
          return res.status(400).json({ error: 'Bình luận gốc không hợp lệ' });
        }

        if (parent.parentId !== null) {
          return res.status(400).json({
            error: 'Chỉ có thể trả lời bình luận gốc (một cấp)',
          });
        }

        parentId = parent.id;
      }

      const createData: Prisma.TaskCommentUncheckedCreateInput = {
        taskId: canonicalTaskId,
        userId: session.user.id,
        body: parsed.body,
        ...(parentId ? { parentId } : {}),
      };

      const created = await prisma.taskComment.create({
        data: createData,
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

      const authorName =
        session.user.name?.trim() ||
        session.user.email ||
        'Người dùng';

      void notifyTaskCommentParticipants({
        taskSlug: task.slug,
        taskTitle: task.title,
        taskCreatorId: task.creatorId,
        authorId: session.user.id,
        authorName,
        parentId: parentId ?? null,
      }).catch((err) => {
        console.error('notifyTaskCommentParticipants:', err);
      });

      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const first = error.errors[0];
        return res.status(400).json({
          error: first?.message ?? 'Dữ liệu không hợp lệ',
        });
      }
      console.error('Create task comment error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
