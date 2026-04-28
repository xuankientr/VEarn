import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import prisma from '@/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100).optional(),
  username: z
    .string()
    .max(30)
    .regex(/^[a-zA-Z0-9_]*$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới')
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  bio: z.string().max(500, 'Bio tối đa 500 ký tự').optional().nullable(),
  phone: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  avatar: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  // New profile fields
  skills: z.array(z.string()).max(20).optional(),
  portfolioLinks: z.array(z.string().url()).max(10).optional(),
  website: z.string().url().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  socialLinks: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  availability: z.enum(['full-time', 'part-time', 'freelance', 'not-available']).optional().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          skills: true,
          portfolioLinks: true,
          website: true,
          location: true,
          company: true,
          socialLinks: true,
          hourlyRate: true,
          availability: true,
          _count: {
            select: {
              createdTasks: true,
              assignedTasks: true,
              submissions: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy user' });
      }

      return res.status(200).json({ data: user });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const validation = updateProfileSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.errors,
        });
      }

      const {
        name,
        username,
        bio,
        phone,
        avatar,
        skills,
        portfolioLinks,
        website,
        location,
        company,
        socialLinks,
        hourlyRate,
        availability,
      } = validation.data;

      // Check username uniqueness if provided
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            NOT: { id: session.user.id },
          },
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Username đã được sử dụng' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(username !== undefined && { username }),
          ...(bio !== undefined && { bio }),
          ...(phone !== undefined && { phone }),
          ...(avatar !== undefined && { avatar }),
          ...(skills !== undefined && { skills }),
          ...(portfolioLinks !== undefined && { portfolioLinks }),
          ...(website !== undefined && { website }),
          ...(location !== undefined && { location }),
          ...(company !== undefined && { company }),
          ...(socialLinks !== undefined && {
            socialLinks:
              socialLinks === null
                ? Prisma.DbNull
                : (socialLinks as Prisma.InputJsonValue),
          }),
          ...(hourlyRate !== undefined && { hourlyRate }),
          ...(availability !== undefined && { availability }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          skills: true,
          portfolioLinks: true,
          website: true,
          location: true,
          company: true,
          socialLinks: true,
          hourlyRate: true,
          availability: true,
        },
      });

      return res.status(200).json({
        message: 'Cập nhật thành công',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
