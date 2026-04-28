import crypto from 'crypto';

const VNP_VERSION = '2.1.0';
const VNP_COMMAND = 'pay';
const VNP_CURR = 'VND';
const VNP_LOCALE = 'vn';
const VNP_ORDER_TYPE = 'other';

export interface VnpayCreatePaymentParams {
  readonly tmnCode: string;
  readonly hashSecret: string;
  readonly amountVnd: number;
  readonly orderRef: string;
  readonly orderInfo: string;
  readonly returnUrl: string;
  readonly ipAddr: string;
  readonly paymentUrl?: string;
  /** URL IPN (webhook) — khuyến nghị cấu hình trên VNPAY + gửi khi tạo giao dịch */
  readonly ipnUrl?: string;
}

/**
 * Build VNPay sandbox/production payment URL (query string signed with HMAC SHA512).
 * @see https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop
 */
export const buildVnpayPaymentUrl = (params: VnpayCreatePaymentParams): string => {
  const baseUrl =
    params.paymentUrl ||
    process.env.VNPAY_PAYMENT_URL ||
    'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

  const createDate = formatVnpDate(new Date());
  const expire = new Date(Date.now() + 15 * 60 * 1000);
  const expireDate = formatVnpDate(expire);

  const amountMinor = Math.round(params.amountVnd) * 100;

  const data: Record<string, string> = {
    vnp_Version: VNP_VERSION,
    vnp_Command: VNP_COMMAND,
    vnp_TmnCode: params.tmnCode,
    vnp_Amount: String(amountMinor),
    vnp_CurrCode: VNP_CURR,
    vnp_TxnRef: params.orderRef,
    vnp_OrderInfo: params.orderInfo.slice(0, 255),
    vnp_OrderType: VNP_ORDER_TYPE,
    vnp_Locale: VNP_LOCALE,
    vnp_ReturnUrl: params.returnUrl,
    vnp_IpAddr: params.ipAddr.slice(0, 45),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (params.ipnUrl) {
    data.vnp_IpnUrl = params.ipnUrl;
  }

  const sortedKeys = Object.keys(data).sort();
  const signData = sortedKeys.map((k) => `${k}=${data[k]}`).join('&');

  const hmac = crypto.createHmac('sha512', params.hashSecret);
  hmac.update(Buffer.from(signData, 'utf-8'));
  const secureHash = hmac.digest('hex');

  const query = new URLSearchParams({ ...data, vnp_SecureHash: secureHash });
  return `${baseUrl}?${query.toString()}`;
};

/**
 * Verify VNPay callback query (return URL or IPN). Returns parsed amount in VND if valid.
 */
export const verifyVnpayCallback = (
  query: Record<string, string | string[] | undefined>,
  hashSecret: string
): { ok: true; txnRef: string; amountVnd: number; transactionNo: string } | { ok: false; reason: string } => {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    flat[k] = Array.isArray(v) ? v[0] : v;
  }

  const secureHash = flat.vnp_SecureHash;
  if (!secureHash || typeof secureHash !== 'string') {
    return { ok: false, reason: 'missing_hash' };
  }

  const signKeys = Object.keys(flat)
    .filter((k) => k.startsWith('vnp_') && k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType')
    .sort();

  const signData = signKeys.map((k) => `${k}=${flat[k]}`).join('&');

  const hmac = crypto.createHmac('sha512', hashSecret);
  hmac.update(Buffer.from(signData, 'utf-8'));
  const expected = hmac.digest('hex');

  if (expected !== secureHash) {
    return { ok: false, reason: 'invalid_signature' };
  }

  const rspCode = flat.vnp_ResponseCode ?? flat.vnp_TransactionStatus;
  if (rspCode !== '00') {
    return { ok: false, reason: `gateway_${rspCode}` };
  }

  const amountMinor = parseInt(flat.vnp_Amount || '0', 10);
  const txnRef = flat.vnp_TxnRef || '';
  const transactionNo = flat.vnp_TransactionNo || '';

  if (!txnRef) {
    return { ok: false, reason: 'missing_txn_ref' };
  }

  return {
    ok: true,
    txnRef,
    amountVnd: amountMinor / 100,
    transactionNo,
  };
};

const formatVnpDate = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
};

export const isVnpayConfigured = (): boolean =>
  Boolean(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET);
