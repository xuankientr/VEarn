import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';
import { z } from 'zod';
import { notifyApplicationApproved, notifyApplicationRejected } from '@/lib/notifications';

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

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  if (session.user.role !== 'BUSINESS') {
    return res.status(403).json({ error: 'Chỉ doanh nghiệp chủ task mới duyệt đơn' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  try {
    const data = reviewSchema.parse(req.body);

    // Get application with task info
    const application = await prisma.taskApplication.findUnique({
      where: { id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            maxAssignees: true,
            status: true,
            _count: {
              select: { assignees: true },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Đơn ứng tuyển không tồn tại' });
    }

    // Verify ownership
    if (application.task.creatorId !== session.user.id) {
      return res.status(403).json({ error: 'Không có quyền duyệt đơn này' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ error: 'Đơn ứng tuyển đã được xử lý' });
    }

    // If approving, check capacity
    if (data.status === 'APPROVED') {
      if (application.task._count.assignees >= application.task.maxAssignees) {
        return res.status(400).json({ error: 'Task đã đủ số người nhận' });
      }

      const recruitingStatuses = ['OPEN', 'IN_PROGRESS'] as const;
      if (
        !recruitingStatuses.includes(
          application.task.status as (typeof recruitingStatuses)[number]
        )
      ) {
        return res.status(400).json({
          error: 'Task không ở trạng thái cho phép duyệt thêm người',
        });
      }

      const nextAssigneeCount = application.task._count.assignees + 1;
      /** Đồng bộ với claim: đủ slot → đang thực hiện; còn slot → vẫn mở tuyển */
      const nextTaskStatus =
        nextAssigneeCount >= application.task.maxAssignees
          ? 'IN_PROGRESS'
          : 'OPEN';

      // Update application and add to assignees in a transaction
      const [updatedApplication] = await prisma.$transaction([
        prisma.taskApplication.update({
          where: { id },
          data: {
            status: 'APPROVED',
            feedback: data.feedback,
            reviewedAt: new Date(),
          },
        }),
        prisma.task.update({
          where: { id: application.taskId },
          data: {
            assignees: {
              connect: { id: application.applicantId },
            },
            status: nextTaskStatus,
          },
        }),
      ]);

      // Notify applicant
      await notifyApplicationApproved(
        application.applicantId,
        application.task.title,
        application.taskId
      );

      return res.status(200).json({
        success: true,
        message: `Đã duyệt đơn của ${application.applicant.name}`,
        data: updatedApplication,
      });
    } else {
      // Reject
      const updatedApplication = await prisma.taskApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          feedback: data.feedback,
          reviewedAt: new Date(),
        },
      });

      // Notify applicant
      await notifyApplicationRejected(
        application.applicantId,
        application.task.title,
        data.feedback
      );

      return res.status(200).json({
        success: true,
        message: `Đã từ chối đơn của ${application.applicant.name}`,
        data: updatedApplication,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }
    console.error('Review application error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
