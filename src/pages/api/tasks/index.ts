import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import slugify from 'slugify';

const coverImageUrlCreate = z
  .string()
  .max(2048)
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = v.trim();
    return t === '' ? undefined : t;
  })
  .refine(
    (v) =>
      v === undefined ||
      v.startsWith('/') ||
      /^https?:\/\//i.test(v),
    { message: 'URL ảnh phải bắt đầu bằng / hoặc http(s)://' }
  );

const createTaskSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  requirements: z.string().optional().nullable(),
  reward: z.number().positive('Tiền thưởng phải lớn hơn 0'),
  deadline: z.string().optional().nullable(),
  maxAssignees: z.number().int().positive().default(1),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  coverImageUrl: coverImageUrlCreate,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - List tasks with advanced search
  if (req.method === 'GET') {
    try {
      const {
        // Pagination
        page = '1',
        limit = '10',
        // Filters
        status,
        category,
        featured,
        search,
        skills,
        minReward,
        maxReward,
        hasDeadline,
        deadlineBefore,
        creatorId,
        // Sorting
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 50); // Cap at 50

      const where: any = {
        isPublished: true,
      };

      // Status filter
      if (status) {
        where.status = status;
      }

      // Category filter
      if (category) {
        where.category = category;
      }

      // Featured filter
      if (featured === 'true') {
        where.isFeatured = true;
      }

      // Text search (title + description)
      if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }

      // Skills filter (match any)
      if (skills) {
        const skillsArray = (typeof skills === 'string' ? skills.split(',') : skills) as string[];
        where.skills = { hasSome: skillsArray };
      }

      // Reward range
      if (minReward || maxReward) {
        where.reward = {};
        if (minReward) where.reward.gte = parseFloat(minReward as string);
        if (maxReward) where.reward.lte = parseFloat(maxReward as string);
      }

      // Deadline filters
      if (hasDeadline === 'true') {
        where.deadline = { not: null };
      } else if (hasDeadline === 'false') {
        where.deadline = null;
      }

      if (deadlineBefore) {
        where.deadline = {
          ...where.deadline,
          lte: new Date(deadlineBefore as string),
        };
      }

      // Creator filter
      if (creatorId) {
        where.creatorId = creatorId;
      }

      // Build orderBy
      const validSortFields = ['createdAt', 'reward', 'deadline', 'title'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
      const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

      const orderBy: any[] = [];
      if (featured !== 'false') {
        orderBy.push({ isFeatured: 'desc' });
      }
      orderBy.push({ [sortField as string]: orderDirection });

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                submissions: true,
                assignees: true,
              },
            },
          },
          orderBy,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.task.count({ where }),
      ]);

      // Get available categories and skills for filter UI
      const [categories, allSkills] = await Promise.all([
        prisma.task.groupBy({
          by: ['category'],
          where: { isPublished: true, category: { not: null } },
          _count: true,
        }),
        prisma.task.findMany({
          where: { isPublished: true },
          select: { skills: true },
        }),
      ]);

      const uniqueSkills = Array.from(
        new Set(allSkills.flatMap((t) => t.skills))
      ).sort();

      return res.json({
        success: true,
        data: tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        filters: {
          categories: categories
            .filter((c) => c.category)
            .map((c) => ({ name: c.category, count: c._count })),
          skills: uniqueSkills,
        },
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  // POST - Create task (Business only)
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
      }

      if (!['BUSINESS', 'ADMIN'].includes(session.user.role)) {
        return res.status(403).json({ error: 'Không có quyền tạo task' });
      }

      const data = createTaskSchema.parse(req.body);

      // Generate unique slug
      let slug = slugify(data.title, { lower: true, strict: true });
      const existingSlug = await prisma.task.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      const task = await prisma.task.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          requirements: data.requirements,
          reward: data.reward,
          deadline: data.deadline ? new Date(data.deadline) : null,
          maxAssignees: data.maxAssignees,
          category: data.category,
          skills: data.skills || [],
          creatorId: session.user.id,
          status: data.isPublished ? 'OPEN' : 'DRAFT',
          isPublished: data.isPublished ?? false,
          isFeatured: data.isFeatured ?? false,
          coverImageUrl: data.coverImageUrl ?? null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: error.errors,
        });
      }

      console.error('Create task error:', error);
      return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
