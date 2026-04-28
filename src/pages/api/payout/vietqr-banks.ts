import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVietQrBanksCached } from '@/lib/payment-gateways/vietqr-banks';

/**
 * Danh sách ngân hàng VietQR (cho dropdown chọn NH).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  try {
    const banks = await getVietQrBanksCached();
    res.status(200).json({ success: true, data: banks });
  } catch (e) {
    console.error('vietqr-banks:', e);
    res.status(502).json({ error: 'Không tải được danh sách ngân hàng' });
  }
}
