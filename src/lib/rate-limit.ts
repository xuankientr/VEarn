/**
 * Giới hạn tần suất theo IP (in-memory). Đủ cho một instance/container;
 * scale ngang nên dùng Redis / Upstash (xem docs).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const prune = (): void => {
  const now = Date.now();
  buckets.forEach((b, k) => {
    if (now > b.resetAt) {
      buckets.delete(k);
    }
  });
};

/**
 * @returns `true` nếu được phép, `false` nếu đã vượt giới hạn
 */
export const allowRateLimit = (
  key: string,
  max: number,
  windowMs: number,
): boolean => {
  prune();
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) {
    return false;
  }
  b.count += 1;
  return true;
};

export const getClientIp = (req: {
  headers: Partial<Record<string, string | string[] | undefined>>;
  socket: { remoteAddress?: string };
}): string => {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    return xff.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(',')[0]?.trim() || 'unknown';
  }
  return req.socket.remoteAddress || 'unknown';
};
