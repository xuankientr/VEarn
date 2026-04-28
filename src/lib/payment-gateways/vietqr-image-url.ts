/**
 * Tạo URL ảnh QR VietQR (img.vietqr.io) cho chuyển khoản.
 * @see https://www.vietqr.io/en/danh-sach-api/link-tao-ma-nhanh/
 */

export interface VietQrImageParams {
  readonly bankId: string;
  readonly accountNo: string;
  readonly amount: number;
  readonly addInfo: string;
  readonly accountName: string;
  readonly template?: string;
}

/**
 * Chuẩn hoá nội dung CK: tối đa 50 ký tự, ký tự an toàn cho VietQR.
 */
export const sanitizeVietQrAddInfo = (raw: string): string => {
  const s = raw.normalize('NFC').replace(/[^a-zA-Z0-9]/g, '').slice(0, 50);
  return s.length > 0 ? s : 'VEARN';
};

/**
 * Tên chủ TK hiển thị trên QR: bỏ dấu, không ký tự đặc biệt, tối đa 50 ký tự.
 */
export const sanitizeVietQrAccountName = (raw: string): string => {
  const noMarks = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
  const slug = noMarks
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
  return slug.length > 0 ? slug : 'VEARN';
};

/**
 * @returns URL ảnh từ img.vietqr.io (dùng làm `src` của thẻ img).
 */
export const buildVietQrImageUrl = (params: VietQrImageParams): string => {
  const template = params.template ?? 'compact2';
  const bankId = params.bankId.trim();
  const accountNo = params.accountNo.replace(/\s/g, '');
  const base = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
  const q = new URLSearchParams();
  q.set('amount', String(Math.round(params.amount)));
  q.set('addInfo', sanitizeVietQrAddInfo(params.addInfo));
  q.set('accountName', sanitizeVietQrAccountName(params.accountName));
  return `${base}?${q.toString()}`;
};
