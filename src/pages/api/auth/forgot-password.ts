import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { allowRateLimit, getClientIp } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

const FORGOT_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_MAX = 5;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = getClientIp(req);
    if (!allowRateLimit(`forgot:${ip}`, FORGOT_MAX, FORGOT_WINDOW_MS)) {
      return res.status(429).json({
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      });
    }

    const data = schema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const base =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';
    const resetUrl = `${base.replace(/\/$/, '')}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    const sent = await sendPasswordResetEmail(user.email, resetUrl);
    if (!sent && process.env.NODE_ENV === 'production') {
      console.error(
        '[forgot-password] Không gửi được email (kiểm tra RESEND_API_KEY / EMAIL_FROM). User:',
        user.id,
      );
    }

    return res.json({
      success: true,
      message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Email không hợp lệ',
        details: error.errors,
      });
    }

    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
