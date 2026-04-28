/**
 * Register Page - Linear/Vercel Inspired
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { api } from '@/lib/api';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  Users,
  Check,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { commercialPasswordSchema } from '@/lib/password-policy';

const ease = [0.16, 1, 0.3, 1] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CONTRIBUTOR' as 'CONTRIBUTOR' | 'BUSINESS',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }

    const pw = commercialPasswordSchema.safeParse(formData.password);
    if (!pw.success) {
      toast.error(pw.error.issues[0]?.message ?? 'Mật khẩu không đủ mạnh');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/auth/login');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Đăng ký - VEarn</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a] flex">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] 
                         bg-violet-500/[0.05] blur-[100px] rounded-full" />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="w-full max-w-sm"
          >
            {/* Logo */}
            <div className="mb-8">
              <Logo size="sm" />
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-white">Tạo tài khoản</h1>
              <p className="text-[13px] text-slate-500 mt-1">
                Bắt đầu hành trình kiếm tiền cùng VEarn
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-[13px] font-medium text-slate-300 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-premium pl-10"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

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

              <div className="grid gap-3 sm:grid-cols-2">
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
                      minLength={8}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-premium pl-10 pr-10"
                      placeholder="Tối thiểu 8 ký tự"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-slate-300 mb-1.5">
                    Xác nhận
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input-premium pl-10"
                      placeholder="Nhập lại"
                    />
                  </div>
                </div>
              </div>
              <p className="-mt-1 mb-3 text-[11px] text-slate-500">
                Mật khẩu: ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.
              </p>

              {/* Role */}
              <div>
                <label className="block text-[13px] font-medium text-slate-300 mb-2">
                  Vai trò của bạn
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleOption
                    selected={formData.role === 'CONTRIBUTOR'}
                    onClick={() => setFormData({ ...formData, role: 'CONTRIBUTOR' })}
                    icon={<Users className="h-4 w-4" />}
                    label="Cộng tác viên"
                    hint="Nhận task kiếm tiền"
                  />
                  <RoleOption
                    selected={formData.role === 'BUSINESS'}
                    onClick={() => setFormData({ ...formData, role: 'BUSINESS' })}
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Doanh nghiệp"
                    hint="Đăng task tuyển dụng"
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-white/5 
                            text-accent-500 focus:ring-accent-500/20"
                />
                <span className="text-[12px] text-slate-500">
                  Tôi đồng ý với{' '}
                  <Link href="/legal/terms" className="text-accent-400 hover:text-accent-300">
                    Điều khoản
                  </Link>
                  {' '}và{' '}
                  <Link href="/legal/privacy" className="text-accent-400 hover:text-accent-300">
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-10"
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>Đăng ký</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-5 text-center text-[13px] text-slate-500">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                Đăng nhập
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right - Benefits (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 relative">
          <div />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
              Tham gia VEarn ngay
            </h2>
            <p className="text-slate-400 max-w-sm mb-8">
              Hàng trăm cơ hội việc làm đang chờ bạn
            </p>

            <div className="space-y-3">
              {[
                'Đa dạng công việc từ nhiều lĩnh vực',
                'Thanh toán nhanh chóng & minh bạch',
                'An toàn, bảo mật - Hỗ trợ 24/7',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, ease }}
                  className="flex items-center gap-3"
                >
                  <div className="h-5 w-5 rounded-full bg-accent-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-accent-400" />
                  </div>
                  <span className="text-[14px] text-slate-300">{text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex gap-6">
              <div>
                <p className="text-2xl font-semibold text-white">200+</p>
                <p className="text-[12px] text-slate-500">Cộng tác viên</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">50+</p>
                <p className="text-[12px] text-slate-500">Doanh nghiệp</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">500+</p>
                <p className="text-[12px] text-slate-500">Tasks</p>
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

function RoleOption({
  selected,
  onClick,
  icon,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3 rounded-lg text-left transition-all duration-150
                 ${selected
                   ? 'bg-accent-500/10 border border-accent-500/30 ring-1 ring-accent-500/20'
                   : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05]'}`}
    >
      {selected && (
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-500 
                       flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-white" />
        </div>
      )}
      <div className={`mb-1.5 ${selected ? 'text-accent-400' : 'text-slate-500'}`}>
        {icon}
      </div>
      <p className="text-[13px] font-medium text-white">{label}</p>
      <p className="text-[11px] text-slate-500">{hint}</p>
    </button>
  );
}
