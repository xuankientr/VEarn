import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Inter } from 'next/font/google';

import Providers from '@/components/providers';

import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const Toaster = dynamic(() => import('sonner').then((mod) => mod.Toaster), {
  ssr: false,
});

const TopLoader = dynamic(
  () => import('@/components/ui/toploader').then((mod) => mod.TopLoader),
  { ssr: false }
);

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <div className={`${inter.variable} font-sans antialiased`}>
      <Head>
        <title>VEarn - Nền tảng kiếm tiền theo nhiệm vụ</title>
        <meta
          name="description"
          content="VEarn - Nền tảng kết nối doanh nghiệp với cộng tác viên qua các công việc thực tế."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0a0f1a" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Providers>
        <TopLoader />
        <Component {...pageProps} key={router.asPath} />
        <Toaster
          position="bottom-right"
          theme="dark"
          gap={8}
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              color: '#f1f5f9',
              fontSize: '13px',
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            },
            classNames: {
              success: 'border-emerald-500/20',
              error: 'border-rose-500/20',
            },
          }}
        />
      </Providers>
    </div>
  );
}

export default App;
