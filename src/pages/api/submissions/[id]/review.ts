import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { notifySubmissionApproved, notifySubmissionRejected } from '@/lib/notifications';

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  feedback: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Submission ID không hợp lệ' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        task: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Không tìm thấy submission' });
    }

    if (submission.task.creatorId !== session.user.id) {
      return res.status(403).json({ error: 'Không có quyền duyệt' });
    }

    if (submission.status !== 'PENDING') {
      return res.status(400).json({ error: 'Submission đã được duyệt' });
    }

    const data = reviewSchema.parse(req.body);

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: data.status,
        feedback: data.feedback,
        reviewedAt: new Date(),
      },
    });

    // If approved, create payment record and update task
    if (data.status === 'APPROVED') {
      await prisma.payment.create({
        data: {
          amount: submission.task.reward,
          contributorId: submission.contributorId,
          submissionId: submission.id,
        },
      });

      await prisma.task.update({
        where: { id: submission.taskId },
        data: { status: 'APPROVED' },
      });

      // Notify contributor
      await notifySubmissionApproved(
        submission.contributorId,
        submission.task.title,
        submission.task.reward
      );
    } else {
      // If rejected, set task back to IN_PROGRESS so contributor can resubmit
      await prisma.task.update({
        where: { id: submission.taskId },
        data: { status: 'IN_PROGRESS' },
      });

      // Notify contributor with feedback
      await notifySubmissionRejected(
        submission.contributorId,
        submission.task.title,
        submission.taskId,
        data.feedback
      );
    }

    return res.json({
      success: true,
      message: data.status === 'APPROVED' ? 'Đã duyệt submission' : 'Đã từ chối submission',
      data: updatedSubmission,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    console.error('Review submission error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
