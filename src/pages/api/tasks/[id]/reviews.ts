import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID không hợp lệ' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    // Get task with reviews
    const task = await prisma.task.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatar: true, role: true },
            },
            reviewee: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        submissions: {
          where: { status: 'APPROVED' },
          select: { contributorId: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    // Determine if current user can leave a review
    let canReview = false;
    let pendingReviews: { userId: string; name: string }[] = [];

    if (session?.user && task.status === 'APPROVED') {
      const isCreator = task.creatorId === session.user.id;
      const isContributor = task.submissions.some(
        (s) => s.contributorId === session.user.id
      );

      if (isCreator) {
        // Business can review all approved contributors they haven't reviewed yet
        for (const sub of task.submissions) {
          const hasReviewed = task.reviews.some(
            (r) => r.reviewerId === session.user.id && r.revieweeId === sub.contributorId
          );
          if (!hasReviewed) {
            const contributor = await prisma.user.findUnique({
              where: { id: sub.contributorId },
              select: { id: true, name: true },
            });
            if (contributor) {
              pendingReviews.push({ userId: contributor.id, name: contributor.name });
            }
          }
        }
        canReview = pendingReviews.length > 0;
      } else if (isContributor) {
        // Contributor can review business if not already reviewed
        const hasReviewed = task.reviews.some(
          (r) => r.reviewerId === session.user.id && r.revieweeId === task.creatorId
        );
        if (!hasReviewed) {
          const creator = await prisma.user.findUnique({
            where: { id: task.creatorId },
            select: { id: true, name: true },
          });
          if (creator) {
            pendingReviews.push({ userId: creator.id, name: creator.name });
          }
        }
        canReview = pendingReviews.length > 0;
      }
    }

    return res.json({
      success: true,
      data: {
        reviews: task.reviews,
        canReview,
        pendingReviews,
      },
    });
  } catch (error) {
    console.error('Get task reviews error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
