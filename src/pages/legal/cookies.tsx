import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  return (
    <>
      <Head>
        <title>Chính sách cookie - VEarn</title>
      </Head>
      <div className="min-h-screen bg-[#0a0f1a] text-slate-300">
        <header className="border-b border-white/5 px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size="sm" href="/" />
              <span className="font-semibold text-white">VEarn</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="page-title">Chính sách cookie</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}.
          </p>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[15px] leading-relaxed">
            <p>
              Cookie và công nghệ tương tự giúp duy trì phiên đăng nhập (NextAuth), ghi nhớ tùy chọn
              và bảo mật cơ bản.
            </p>
            <h2 className="text-lg font-semibold text-white">Cookie cần thiết</h2>
            <p>
              Không thể tắt: cookie phiên, CSRF / bảo mật do framework và nhà cung cấp xác thực đặt.
            </p>
            <h2 className="text-lg font-semibold text-white">Phân tích (tuỳ chọn)</h2>
            <p>
              Nếu bạn bật công cụ phân tích (ví dụ PostHog / GA), cần cập nhật mục này và banner đồng
              ý theo luật địa phương.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
