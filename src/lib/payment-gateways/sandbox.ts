/**
 * Chế độ thanh toán sandbox nội bộ (nạp/rút mô phỏng, không cổng thật).
 * Phù hợp đồ án/MVP: bật PAYMENT_SANDBOX=true trong .env (xem README).
 * Trên production, sandbox tắt trừ khi PAYMENT_SANDBOX_ALLOW_PROD=true.
 */
export const isPaymentSandboxEnabled = (): boolean => {
  if (process.env.PAYMENT_SANDBOX !== 'true') {
    return false;
  }
  if (process.env.NODE_ENV === 'production') {
    return process.env.PAYMENT_SANDBOX_ALLOW_PROD === 'true';
  }
  return true;
};
