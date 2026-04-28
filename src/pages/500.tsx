import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>500 - Lỗi máy chủ - VEarn</title>
      </Head>

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-red-50">
        {/* Header */}
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Logo size="lg" />
          </div>
        </header>

        {/* Content */}
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            {/* Error Illustration */}
            <div className="relative mx-auto mb-8 h-64 w-64">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-red-200 to-orange-200 opacity-50 blur-3xl" />
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="rounded-full bg-red-100 p-8">
                  <AlertTriangle className="h-24 w-24 text-red-500" />
                </div>
              </div>
            </div>

            <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Có lỗi xảy ra!
            </h1>
            <p className="mx-auto mb-8 max-w-md text-slate-500">
              Máy chủ gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau
              hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                Thử lại
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <Home className="h-5 w-5" />
                Về trang chủ
              </Link>
            </div>

            <p className="mt-8 text-sm text-slate-400">
              Mã lỗi: 500 Internal Server Error
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} VEarn. All rights reserved.
        </footer>
      </div>
    </>
  );
}
