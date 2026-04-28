/**
 * Login Page - Linear/Vercel Inspired
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ChevronRight, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';

const ease = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Đăng nhập thành công!');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return (
    <>
      <Head>
        <title>Đăng nhập - VEarn</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a] flex">
        {/* Ambient — cùng tông register (violet) */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[min(900px,100vw)] 
                       bg-violet-500/[0.06] blur-[100px] rounded-full"
          />
          <div
            className="absolute bottom-0 right-0 h-[280px] w-[480px] translate-x-1/4 translate-y-1/4
                       bg-accent-500/[0.04] blur-[90px] rounded-full"
          />
        </div>

        {/* Form — cột trái giống register */}
        <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <Logo size="sm" />
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-white">Đăng nhập</h1>
              <p className="mt-1 text-[13px] text-slate-500">
                Tiếp tục với email và mật khẩu của bạn
              </p>
            </div>

            <div
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6
                         shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_-24px_rgba(0,0,0,0.5)]"
            >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[13px] font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-premium pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[13px] font-medium text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-premium pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 
                              hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 
                              text-accent-500 focus:ring-accent-500/20"
                  />
                  <span className="text-slate-400">Ghi nhớ</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-accent-400 hover:text-accent-300 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-10"
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[13px] text-slate-500">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                Đăng ký
              </Link>
            </p>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Tài khoản demo
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Admin', email: 'admin@vearn.vn', password: 'admin123', badge: 'badge-violet' },
                  { label: 'Business', email: 'techcorp@vearn.vn', password: 'business123', badge: 'badge-accent' },
                  { label: 'User', email: 'nguyen.van.a@gmail.com', password: 'user123', badge: 'badge-emerald' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email, acc.password)}
                    className="group flex w-full items-center justify-between rounded-xl border border-white/[0.06]
                               bg-white/[0.02] p-2.5 text-left transition-all duration-150
                               hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={acc.badge}>{acc.label}</span>
                      <span className="truncate text-[12px] text-slate-500">{acc.email}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-colors group-hover:text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
            </div>
          </motion.div>
        </div>

        {/* Panel phải — giống nhịp register (checklist + số liệu) */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10">
          <div />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
              Chào mừng trở lại
            </h2>
            <p className="mb-8 max-w-sm text-slate-400">
              Truy cập dashboard, task đang làm và ví — mọi thứ ở một nơi.
            </p>

            <div className="space-y-3">
              {[
                'Đăng nhập an toàn, phiên làm việc được mã hóa',
                'Theo dõi task & thanh toán theo thời gian thực',
                'Hồ sơ và thông báo đồng bộ trên mọi thiết bị',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, ease }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20">
                    <Check className="h-3 w-3 text-accent-400" />
                  </div>
                  <span className="text-[14px] text-slate-300">{text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex gap-6">
              <div>
                <p className="text-2xl font-semibold text-white">500+</p>
                <p className="text-[12px] text-slate-500">Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">200+</p>
                <p className="text-[12px] text-slate-500">Cộng tác viên</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">50+</p>
                <p className="text-[12px] text-slate-500">Doanh nghiệp</p>
              </div>
            </div>
          </motion.div>

          <p className="text-[12px] text-slate-600">
            © {new Date().getFullYear()} VEarn. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
