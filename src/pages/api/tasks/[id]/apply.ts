import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';
import { z } from 'zod';
import { notifyNewApplication } from '@/lib/notifications';

const applySchema = z.object({
  coverLetter: z.string().min(50, 'Thư ứng tuyển cần ít nhất 50 ký tự'),
  portfolioLinks: z.array(z.string().url('Link không hợp lệ')).optional(),
  experience: z.string().optional(),
  expectedDays: z.number().min(1).max(365).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  // GET - Check application status
  if (req.method === 'GET') {
    try {
      const application = await prisma.taskApplication.findUnique({
        where: {
          taskId_applicantId: {
            taskId: id,
            applicantId: session.user.id,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error('Get application error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // POST - Submit application
  if (req.method === 'POST') {
    if (session.user.role !== 'CONTRIBUTOR') {
      return res.status(403).json({ error: 'Chỉ Contributor mới có thể ứng tuyển' });
    }

    try {
      const data = applySchema.parse(req.body);

      // Check if task exists and is open
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          _count: {
            select: { assignees: true },
          },
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task._count.assignees >= task.maxAssignees) {
        return res.status(400).json({ error: 'Task đã đủ số người nhận' });
      }

      const canApplyStatuses = ['OPEN', 'IN_PROGRESS'] as const;
      if (
        !canApplyStatuses.includes(
          task.status as (typeof canApplyStatuses)[number]
        )
      ) {
        return res.status(400).json({ error: 'Task không còn mở để ứng tuyển' });
      }

      // Check if already applied
      const existingApplication = await prisma.taskApplication.findUnique({
        where: {
          taskId_applicantId: {
            taskId: id,
            applicantId: session.user.id,
          },
        },
      });

      if (existingApplication) {
        return res.status(400).json({ error: 'Bạn đã ứng tuyển task này rồi' });
      }

      // Create application
      const application = await prisma.taskApplication.create({
        data: {
          coverLetter: data.coverLetter,
          portfolioLinks: data.portfolioLinks || [],
          experience: data.experience,
          expectedDays: data.expectedDays,
          taskId: id,
          applicantId: session.user.id,
        },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Notify task creator
      await notifyNewApplication(
        task.creatorId,
        task.title,
        task.id,
        session.user.name || 'Người dùng'
      );

      return res.status(201).json({
        success: true,
        message: 'Ứng tuyển thành công! Vui lòng chờ doanh nghiệp duyệt.',
        data: application,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }
      console.error('Apply error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // DELETE - Cancel application
  if (req.method === 'DELETE') {
    try {
      const application = await prisma.taskApplication.findUnique({
        where: {
          taskId_applicantId: {
            taskId: id,
            applicantId: session.user.id,
          },
        },
      });

      if (!application) {
        return res.status(404).json({ error: 'Không tìm thấy đơn ứng tuyển' });
      }

      if (application.status !== 'PENDING') {
        return res.status(400).json({ error: 'Chỉ có thể hủy đơn đang chờ duyệt' });
      }

      await prisma.taskApplication.delete({
        where: {
          taskId_applicantId: {
            taskId: id,
            applicantId: session.user.id,
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Đã hủy đơn ứng tuyển',
      });
    } catch (error) {
      console.error('Cancel application error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
