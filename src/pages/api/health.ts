import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/prisma';

/**
 * Health check cho load balancer / orchestrator (không cần auth).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      ok: true,
      service: 'vearn',
      ts: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      ok: false,
      error: 'database_unavailable',
      ts: new Date().toISOString(),
    });
  }
}
