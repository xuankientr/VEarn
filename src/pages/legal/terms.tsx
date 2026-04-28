import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Điều khoản sử dụng - VEarn</title>
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
          <h1 className="page-title">Điều khoản sử dụng</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}. Vui lòng thay nội dung
            bằng văn bản pháp lý do luật sư soạn trước khi go-live.
          </p>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[15px] leading-relaxed">
            <p>
              Nền tảng VEarn kết nối doanh nghiệp đăng task và cộng tác viên thực hiện công việc.
              Bằng việc truy cập hoặc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản dưới đây.
            </p>
            <h2 className="text-lg font-semibold text-white">1. Tài khoản</h2>
            <p>
              Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. Thông tin đăng ký phải chính xác.
              Chúng tôi có thể tạm khóa tài khoản vi phạm pháp luật hoặc lạm dụng nền tảng.
            </p>
            <h2 className="text-lg font-semibold text-white">2. Task &amp; thanh toán</h2>
            <p>
              Điều kiện reward, deadline và chất lượng bàn giao do người đăng task mô tả. Thanh toán
              cho cộng tác viên tuân theo quy trình trên nền tảng và chính sách từng chiến dịch.
            </p>
            <h2 className="text-lg font-semibold text-white">3. Giới hạn trách nhiệm</h2>
            <p>
              VEarn là nền tảng trung gian. Tranh chấp giữa các bên nên được giải quyết trực tiếp;
              chúng tôi có thể hỗ trợ điều phối theo chính sách nội bộ.
            </p>
            <h2 className="text-lg font-semibold text-white">4. Liên hệ</h2>
            <p>
              Mọi yêu cầu pháp lý: cập nhật email hỗ trợ trong mã nguồn hoặc trang Liên hệ trước khi
              go-live.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
