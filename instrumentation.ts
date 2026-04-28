/**
 * Next.js instrumentation — chạy một lần khi khởi động Node server.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }
  const { assertProductionEnv } = await import('./src/lib/env-server');
  assertProductionEnv();
}
