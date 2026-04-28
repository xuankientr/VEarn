import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Chính sách bảo mật - VEarn</title>
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
          <h1 className="page-title">Chính sách bảo mật</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}. Thay thế bằng bản chính thức
            (GDPR / NĐ 13 / nội bộ) trước khi thu thập dữ liệu người dùng thật quy mô lớn.
          </p>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[15px] leading-relaxed">
            <p>
              Chúng tôi tôn trọng quyền riêng tư. Chính sách này mô tả dữ liệu thu thập, mục đích sử
              dụng và lựa chọn của bạn.
            </p>
            <h2 className="text-lg font-semibold text-white">1. Dữ liệu thu thập</h2>
            <p>
              Thông tin tài khoản (email, tên hiển thị), nội dung bạn gửi (task, submission, tin nhắn
              hỗ trợ), và dữ liệu kỹ thuật cần thiết để vận hành (log, cookie phiên).
            </p>
            <h2 className="text-lg font-semibold text-white">2. Mục đích</h2>
            <p>
              Cung cấp dịch vụ, xác thực, chống gian lận, cải thiện sản phẩm và tuân thủ pháp luật.
            </p>
            <h2 className="text-lg font-semibold text-white">3. Chia sẻ</h2>
            <p>
              Không bán dữ liệu cá nhân. Chia sẻ với nhà cung cấp hạ tầng (hosting, email, thanh toán)
              theo hợp đồng bảo mật dữ liệu.
            </p>
            <h2 className="text-lg font-semibold text-white">4. Quyền của bạn</h2>
            <p>
              Yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu trong phạm vi pháp luật — liên hệ qua kênh
              hỗ trợ (cấu hình trước go-live).
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
