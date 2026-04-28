/**
 * Forgot Password Page - Premium Dark Theme
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Mail, ArrowLeft, Loader2, CheckCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => api.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      setSent(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  return (
    <>
      <Head>
        <title>Quên mật khẩu - VEarn</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] p-4">
        {/* Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/15 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/15 blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <Logo size="xl" />
          </div>

          {/* Card */}
          <div className="glass-card p-8">
            {sent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h1 className="mb-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Kiểm tra email của bạn
                </h1>
                <p className="mb-6 text-slate-400">
                  Nếu tài khoản với email <span className="text-white font-medium">{email}</span> tồn tại, 
                  chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/20">
                    <KeyRound className="h-7 w-7 text-accent-400" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Quên mật khẩu?
                  </h1>
                  <p className="mt-2 text-slate-400">
                    Nhập email để nhận link đặt lại mật khẩu
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-premium pl-12"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="btn-primary w-full py-3"
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <span>Gửi link đặt lại mật khẩu</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-accent-400 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
