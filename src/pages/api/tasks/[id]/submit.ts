import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { notifyNewSubmission } from '@/lib/notifications';

const submitSchema = z.object({
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  links: z.array(z.string()).optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
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
    return res.status(400).json({ error: 'Task ID không hợp lệ' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignees: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    // Check if assigned
    const isAssigned = task.assignees.some((a) => a.id === session.user.id);

    if (!isAssigned) {
      return res.status(403).json({ error: 'Bạn chưa nhận task này' });
    }

    // Check if already has active submission (PENDING or APPROVED)
    // Allow resubmit if previous submission was REJECTED
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        taskId: id,
        contributorId: session.user.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingSubmission) {
      const message = existingSubmission.status === 'PENDING' 
        ? 'Bạn đã có submission đang chờ duyệt'
        : 'Submission của bạn đã được duyệt';
      return res.status(400).json({ error: message });
    }

    const data = submitSchema.parse(req.body);

    // Create submission
    const fileUrls = data.files?.map((f) => f.url) || [];
    const submission = await prisma.submission.create({
      data: {
        content: data.content,
        links: data.links || [],
        fileUrls: fileUrls,
        taskId: id,
        contributorId: session.user.id,
      },
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            reward: true,
          },
        },
      },
    });

    // Update task status
    await prisma.task.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });

    // Notify task creator
    await notifyNewSubmission(
      task.creatorId,
      task.title,
      task.id,
      session.user.name || 'Người dùng'
    );

    return res.status(201).json({
      success: true,
      message: 'Đã nộp bài thành công',
      data: submission,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
