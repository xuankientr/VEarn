import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  link?: string;
  metadata?: any;
  createdAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  const { limit = '20' } = req.query;
  const limitNum = Math.min(parseInt(limit as string), 50);

  try {
    const userId = session.user.id;
    const activities: Activity[] = [];

    // Get submissions (for contributors)
    const submissions = await prisma.submission.findMany({
      where: { contributorId: userId },
      include: {
        task: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: limitNum,
    });

    submissions.forEach((s) => {
      activities.push({
        id: `submission-${s.id}`,
        type: 'submission',
        title:
          s.status === 'APPROVED'
            ? 'Submission được duyệt'
            : s.status === 'REJECTED'
              ? 'Submission bị từ chối'
              : 'Đã nộp bài',
        description: s.task.title,
        link: `/tasks/${s.task.slug}`,
        metadata: { status: s.status },
        createdAt: s.submittedAt,
      });
    });

    // Get applications (for contributors)
    const applications = await prisma.taskApplication.findMany({
      where: { applicantId: userId },
      include: {
        task: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: limitNum,
    });

    applications.forEach((a) => {
      activities.push({
        id: `application-${a.id}`,
        type: 'application',
        title:
          a.status === 'APPROVED'
            ? 'Ứng tuyển được duyệt'
            : a.status === 'REJECTED'
              ? 'Ứng tuyển bị từ chối'
              : 'Đã ứng tuyển',
        description: a.task.title,
        link: `/tasks/${a.task.slug}`,
        metadata: { status: a.status },
        createdAt: a.appliedAt,
      });
    });

    // Get payments received (for contributors)
    const payments = await prisma.payment.findMany({
      where: { contributorId: userId, status: 'PAID' },
      include: {
        submission: {
          include: {
            task: { select: { id: true, title: true, slug: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      take: limitNum,
    });

    payments.forEach((p) => {
      if (p.paidAt) {
        activities.push({
          id: `payment-${p.id}`,
          type: 'payment',
          title: 'Đã nhận thanh toán',
          description: `+${new Intl.NumberFormat('vi-VN').format(p.amount)}đ cho "${p.submission.task.title}"`,
          link: '/dashboard/earnings',
          metadata: { amount: p.amount },
          createdAt: p.paidAt,
        });
      }
    });

    // Get tasks created (for businesses)
    const tasksCreated = await prisma.task.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    tasksCreated.forEach((t) => {
      activities.push({
        id: `task-${t.id}`,
        type: 'task_created',
        title: t.isPublished ? 'Đã đăng task' : 'Đã tạo draft',
        description: t.title,
        link: `/tasks/${t.slug}`,
        metadata: { status: t.status, reward: t.reward },
        createdAt: t.createdAt,
      });
    });

    // Get reviews given
    const reviewsGiven = await prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        reviewee: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    reviewsGiven.forEach((r) => {
      activities.push({
        id: `review-given-${r.id}`,
        type: 'review_given',
        title: `Đã đánh giá ${r.reviewee.name}`,
        description: `${r.rating}/5 sao cho task "${r.task.title}"`,
        link: `/tasks/${r.task.slug}`,
        metadata: { rating: r.rating },
        createdAt: r.createdAt,
      });
    });

    // Get reviews received
    const reviewsReceived = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    reviewsReceived.forEach((r) => {
      activities.push({
        id: `review-received-${r.id}`,
        type: 'review_received',
        title: `Nhận đánh giá từ ${r.reviewer.name}`,
        description: `${r.rating}/5 sao cho task "${r.task.title}"`,
        link: `/tasks/${r.task.slug}`,
        metadata: { rating: r.rating },
        createdAt: r.createdAt,
      });
    });

    // Sort all activities by date and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitNum);

    return res.json({
      success: true,
      data: sortedActivities,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
