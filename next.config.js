/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

if (isProd && process.env.NEXTAUTH_URL?.startsWith('https://')) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Standalone gây lỗi symlink (EPERM) trên Windows khi build local; Docker/Linux dùng image bên dưới copy .next + node_modules.
  ...(process.env.NEXT_STANDALONE_OUTPUT === 'true' ? { output: 'standalone' } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Chỉ bật instrumentation khi build/start production — tránh ảnh hưởng `next dev` (Windows / .next lock).
  experimental: {
    ...(process.env.NODE_ENV === 'production' ? { instrumentationHook: true } : {}),
  },
  async headers() {
    return [
      {
        source: '/',
        headers: securityHeaders,
      },
      {
        // Không gắn header lên chunk `_next` — tránh lỗi dev / MIME trên một số môi trường.
        source: '/((?!_next/static|_next/image|_next/webpack|_next/data|favicon.ico).*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
