import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { commercialPasswordSchema } from '@/lib/password-policy';
import { allowRateLimit, getClientIp } from '@/lib/rate-limit';

const schema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: commercialPasswordSchema,
});

const RESET_WINDOW_MS = 15 * 60 * 1000;
const RESET_MAX = 12;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = getClientIp(req);
    if (!allowRateLimit(`reset-pw:${ip}`, RESET_MAX, RESET_WINDOW_MS)) {
      return res.status(429).json({
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      });
    }

    const data = schema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: data.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
