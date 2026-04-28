import { existsSync } from 'node:fs';
import path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import Stripe from 'stripe';

/**
 * Next thường đã nạp .env; gọi dotenv thêm một lần để API route luôn thấy key
 * khi chạy dev / Docker (một số môi trường load module trước khi inject env).
 * .env.local ghi đè .env (giống Next).
 */
(function loadStripeEnvFromFiles(): void {
  const root = process.cwd();
  const env = path.join(root, '.env');
  const local = path.join(root, '.env.local');
  if (existsSync(env)) {
    loadDotenv({ path: env });
  }
  if (existsSync(local)) {
    loadDotenv({ path: local, override: true });
  }
})();

type StripeClient = InstanceType<typeof Stripe>;

let stripeSingleton: StripeClient | null = null;

const getStripeSecretKey = (): string | undefined => {
  const k = process.env.STRIPE_SECRET_KEY?.trim();
  if (!k) {
    return undefined;
  }
  if (k.startsWith('sk_test_') || k.startsWith('sk_live_')) {
    return k;
  }
  return undefined;
};

export const getStripe = (): StripeClient => {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set or invalid');
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
};

export const isStripeConfigured = (): boolean => Boolean(getStripeSecretKey());

/**
 * Tạo Stripe Checkout (VND — zero-decimal).
 * @see https://stripe.com/docs/currencies#zero-decimal
 */
export const createStripeWalletCheckout = async (params: {
  readonly amountVnd: number;
  readonly gatewayOrderRef: string;
  readonly walletTopUpId: string;
  readonly userId: string;
  readonly userEmail: string | null | undefined;
  readonly successUrl: string;
  readonly cancelUrl: string;
}): Promise<{ readonly url: string } | { readonly error: string }> => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: params.gatewayOrderRef,
      customer_email: params.userEmail ?? undefined,
      metadata: {
        walletTopUpId: params.walletTopUpId,
        userId: params.userId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'vnd',
            unit_amount: Math.round(params.amountVnd),
            product_data: {
              name: 'VEarn — Nạp ví doanh nghiệp',
            },
          },
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    if (!session.url) {
      return { error: 'Stripe không trả URL thanh toán' };
    }

    return { url: session.url };
  } catch (e) {
    console.error('createStripeWalletCheckout:', e);
    const message = e instanceof Error ? e.message : 'Stripe error';
    return { error: message };
  }
};
