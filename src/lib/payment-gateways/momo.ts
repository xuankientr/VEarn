import crypto from 'crypto';

export interface MomoCreatePaymentParams {
  readonly partnerCode: string;
  readonly accessKey: string;
  readonly secretKey: string;
  readonly amountVnd: number;
  readonly orderId: string;
  readonly orderInfo: string;
  readonly redirectUrl: string;
  readonly ipnUrl: string;
  readonly requestId: string;
  readonly endpoint?: string;
}

interface MomoCreateResponse {
  resultCode: number;
  payUrl?: string;
  message?: string;
}

/**
 * Tạo giao dịch MoMo (captureWallet) — test/sandbox endpoint mặc định.
 * @see https://developers.momo.vn/
 */
export const createMomoPayment = async (
  params: MomoCreatePaymentParams
): Promise<{ payUrl: string } | { error: string }> => {
  const endpoint =
    params.endpoint ||
    process.env.MOMO_ENDPOINT ||
    'https://test-payment.momo.vn/v2/gateway/api/create';

  const requestType = 'captureWallet';
  const extraData = '';
  const amount = String(Math.round(params.amountVnd));
  const lang = 'vi';

  const rawSignature =
    `accessKey=${params.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${params.ipnUrl}` +
    `&orderId=${params.orderId}` +
    `&orderInfo=${params.orderInfo}` +
    `&partnerCode=${params.partnerCode}` +
    `&redirectUrl=${params.redirectUrl}` +
    `&requestId=${params.requestId}` +
    `&requestType=${requestType}`;

  const signature = crypto.createHmac('sha256', params.secretKey).update(rawSignature).digest('hex');

  const body = {
    partnerCode: params.partnerCode,
    partnerName: 'VEarn',
    storeId: 'VEarn',
    requestId: params.requestId,
    amount,
    orderId: params.orderId,
    orderInfo: params.orderInfo,
    redirectUrl: params.redirectUrl,
    ipnUrl: params.ipnUrl,
    lang,
    requestType,
    autoCapture: true,
    extraData,
    signature,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as MomoCreateResponse;

  if (json.resultCode !== 0 || !json.payUrl) {
    return { error: json.message || `Momo resultCode=${json.resultCode}` };
  }

  return { payUrl: json.payUrl };
};

/**
 * Xác minh callback IPN MoMo (POST JSON body).
 */
export const verifyMomoIpnSignature = (
  body: Record<string, unknown>,
  secretKey: string
): boolean => {
  const partnerCode = String(body.partnerCode ?? '');
  const accessKey = String(body.accessKey ?? '');
  const requestId = String(body.requestId ?? '');
  const orderId = String(body.orderId ?? '');
  const orderInfo = String(body.orderInfo ?? '');
  const amount = String(body.amount ?? '');
  const orderType = String(body.orderType ?? '');
  const transId = String(body.transId ?? '');
  const resultCode = String(body.resultCode ?? '');
  const message = String(body.message ?? '');
  const payType = String(body.payType ?? '');
  const responseTime = String(body.responseTime ?? '');
  const extraData = String(body.extraData ?? '');

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  return signature === body.signature;
};

export const isMomoConfigured = (): boolean =>
  Boolean(
    process.env.MOMO_PARTNER_CODE &&
      process.env.MOMO_ACCESS_KEY &&
      process.env.MOMO_SECRET_KEY
  );
