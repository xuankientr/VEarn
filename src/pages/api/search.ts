import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, type = 'all', limit = '5' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.json({ success: true, data: { tasks: [], users: [] } });
  }

  const query = q.trim();
  const limitNum = Math.min(parseInt(limit as string), 10);

  try {
    const results: any = { tasks: [], users: [] };

    // Search tasks
    if (type === 'all' || type === 'tasks') {
      const tasks = await prisma.task.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { skills: { hasSome: [query] } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          reward: true,
          status: true,
          creator: {
            select: { name: true },
          },
        },
        take: limitNum,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      });

      results.tasks = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        category: t.category,
        reward: t.reward,
        status: t.status,
        creatorName: t.creator.name,
        type: 'task',
      }));
    }

    // Search users (public profiles only)
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          role: true,
          bio: true,
        },
        take: limitNum,
      });

      results.users = users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        role: u.role,
        bio: u.bio?.substring(0, 100),
        type: 'user',
      }));
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
