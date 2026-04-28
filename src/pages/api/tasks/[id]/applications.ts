import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  const { id } = req.query;
  const { status } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  try {
    // Get task and verify ownership
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        creatorId: true,
        maxAssignees: true,
        _count: {
          select: { assignees: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task không tồn tại' });
    }

    if (task.creatorId !== session.user.id) {
      return res.status(403).json({ error: 'Không có quyền xem đơn ứng tuyển' });
    }

    // Build query
    const where: any = { taskId: id };
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      where.status = status;
    }

    const applications = await prisma.taskApplication.findMany({
      where,
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            _count: {
              select: {
                submissions: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    // Get stats for each applicant
    const applicationsWithStats = await Promise.all(
      applications.map(async (app) => {
        const [approvedSubmissions, totalSubmissions] = await Promise.all([
          prisma.submission.count({
            where: {
              contributorId: app.applicantId,
              status: 'APPROVED',
            },
          }),
          prisma.submission.count({
            where: {
              contributorId: app.applicantId,
            },
          }),
        ]);

        return {
          ...app,
          applicantStats: {
            totalSubmissions,
            approvedSubmissions,
            successRate: totalSubmissions > 0 
              ? Math.round((approvedSubmissions / totalSubmissions) * 100) 
              : 0,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: applicationsWithStats,
      task: {
        id: task.id,
        title: task.title,
        maxAssignees: task.maxAssignees,
        currentAssignees: task._count.assignees,
      },
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
