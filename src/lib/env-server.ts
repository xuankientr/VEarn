import { z } from 'zod';

/**
 * Biến môi trường bắt buộc cho server (API routes, getServerSideProps, v.v.).
 * Production: secret mạnh + NEXTAUTH_URL HTTPS (trừ localhost).
 */
const devSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
});

const prodSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z
    .string()
    .url()
    .refine(
      (u) => u.startsWith('https://') || u.includes('localhost'),
      'Trên production NEXTAUTH_URL phải dùng HTTPS (trừ môi trường local).'
    ),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET cần tối thiểu 32 ký tự trên production'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET cần tối thiểu 32 ký tự trên production'),
});

export type ServerEnv = z.infer<typeof devSchema>;

let cache: ServerEnv | null = null;

export const getServerEnv = (): ServerEnv => {
  if (cache) {
    return cache;
  }
  const isProd = process.env.NODE_ENV === 'production';
  const raw = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  };
  cache = (isProd ? prodSchema : devSchema).parse(raw);
  return cache;
};

/**
 * Gọi khi khởi động server production (instrumentation) để fail-fast nếu cấu hình sai.
 * Không chạy trong `next build` (tránh bắt secret 32 ký tự trên máy dev).
 */
export const assertProductionEnv = (): void => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    return;
  }
  getServerEnv();
  if (process.env.MOMO_IPN_SKIP_VERIFY === 'true') {
    console.warn(
      '[VEarn] MOMO_IPN_SKIP_VERIFY=true — tắt trên production, chỉ dùng khi debug sandbox.'
    );
  }
  if (process.env.COMMERCIAL_MODE === 'true') {
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        '[VEarn] COMMERCIAL_MODE: thiếu RESEND_API_KEY — không gửi được email (đặt lại mật khẩu, thông báo).'
      );
    }
    if (!process.env.EMAIL_FROM?.trim()) {
      console.warn(
        '[VEarn] COMMERCIAL_MODE: nên đặt EMAIL_FROM với domain đã xác minh trên Resend.'
      );
    }
  }
};
