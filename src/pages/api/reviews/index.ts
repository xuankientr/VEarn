import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createReviewSchema = z.object({
  taskId: z.string().uuid(),
  revieweeId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // POST - Create review
  if (req.method === 'POST') {
    try {
      const data = createReviewSchema.parse(req.body);

      // Get task to verify eligibility
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
        include: {
          submissions: {
            where: { status: 'APPROVED' },
            select: { contributorId: true },
          },
          assignees: { select: { id: true } },
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task.status !== 'APPROVED') {
        return res.status(400).json({ error: 'Task chưa hoàn thành' });
      }

      const isCreator = task.creatorId === session.user.id;
      const isContributor = task.submissions.some(
        (s) => s.contributorId === session.user.id
      );

      if (!isCreator && !isContributor) {
        return res.status(403).json({ error: 'Bạn không tham gia task này' });
      }

      // Validate reviewee
      if (isCreator) {
        // Business can only review contributors
        const validContributor = task.submissions.some(
          (s) => s.contributorId === data.revieweeId
        );
        if (!validContributor) {
          return res.status(400).json({ error: 'Người được đánh giá không hợp lệ' });
        }
      } else {
        // Contributor can only review the business
        if (data.revieweeId !== task.creatorId) {
          return res.status(400).json({ error: 'Chỉ có thể đánh giá chủ task' });
        }
      }

      // Check for existing review
      const existingReview = await prisma.review.findUnique({
        where: {
          taskId_reviewerId_revieweeId: {
            taskId: data.taskId,
            reviewerId: session.user.id,
            revieweeId: data.revieweeId,
          },
        },
      });

      if (existingReview) {
        return res.status(400).json({ error: 'Bạn đã đánh giá người này rồi' });
      }

      const review = await prisma.review.create({
        data: {
          rating: data.rating,
          comment: data.comment,
          taskId: data.taskId,
          reviewerId: session.user.id,
          revieweeId: data.revieweeId,
        },
        include: {
          reviewer: {
            select: { id: true, name: true, avatar: true },
          },
          task: {
            select: { id: true, title: true },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Đã gửi đánh giá',
        data: review,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }
      console.error('Create review error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
