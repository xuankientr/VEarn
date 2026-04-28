/**
 * Base URL công khai của app (callback / return URL cho cổng thanh toán).
 */
export const getPublicAppUrl = (): string => {
  const u = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return u.replace(/\/$/, '');
};
