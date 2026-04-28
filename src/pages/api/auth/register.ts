import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '@/prisma';
import { z } from 'zod';
import { commercialPasswordSchema } from '@/lib/password-policy';
import { allowRateLimit, getClientIp } from '@/lib/rate-limit';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: commercialPasswordSchema,
  role: z.enum(['BUSINESS', 'CONTRIBUTOR']).optional(),
});

const REGISTER_WINDOW_MS = 15 * 60 * 1000;
const REGISTER_MAX = 8;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = getClientIp(req);
    if (!allowRateLimit(`register:${ip}`, REGISTER_MAX, REGISTER_WINDOW_MS)) {
      return res.status(429).json({
        error: 'Quá nhiều lần đăng ký từ địa chỉ này. Vui lòng thử lại sau.',
      });
    }

    const data = registerSchema.parse(req.body);

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email đã được đăng ký' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role || 'CONTRIBUTOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    console.error('Register error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
