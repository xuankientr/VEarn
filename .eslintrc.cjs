/**
 * Cấu hình ESLint tương thích Next.js 14 + ESLint 8.
 * File flat cũ được giữ dưới tên `eslint.flat.config.mjs.bak` (tuỳ chọn khôi phục sau).
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'prettier'],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    'pnpm-lock.yaml',
    'next-env.d.ts',
    'src/components/icons/**/*.tsx',
    'eslint.flat.config.mjs.bak',
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off',
  },
};
