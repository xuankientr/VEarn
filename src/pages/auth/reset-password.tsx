import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post('/auth/reset-password', data),
    onSuccess: () => {
      setSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    if (password.length < 8) issues.push('Ít nhất 8 ký tự');
    if (!/[A-Z]/.test(password)) issues.push('Ít nhất 1 chữ hoa');
    if (!/[a-z]/.test(password)) issues.push('Ít nhất 1 chữ thường');
    if (!/[0-9]/.test(password)) issues.push('Ít nhất 1 số');
    return issues;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || typeof token !== 'string') {
      toast.error('Link đặt lại mật khẩu không hợp lệ');
      return;
    }

    const issues = validatePassword(passwords.password);
    if (issues.length > 0) {
      toast.error('Mật khẩu chưa đủ mạnh');
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    resetPasswordMutation.mutate({ token, password: passwords.password });
  };

  const passwordIssues = validatePassword(passwords.password);

  if (!token) {
    return (
      <>
        <Head>
          <title>Đặt lại mật khẩu - VEarn</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <h1 className="mb-2 text-xl font-bold text-slate-900">
              Link không hợp lệ
            </h1>
            <p className="mb-4 text-slate-500">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn
            </p>
            <Link
              href="/auth/forgot-password"
              className="text-indigo-600 hover:text-indigo-700"
            >
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Đặt lại mật khẩu - VEarn</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Logo size="xl" href="/" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-slate-900">
                  Đặt lại mật khẩu thành công!
                </h1>
                <p className="mb-6 text-slate-500">
                  Bạn có thể đăng nhập bằng mật khẩu mới
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-700"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Đặt lại mật khẩu
                  </h1>
                  <p className="mt-2 text-slate-500">
                    Nhập mật khẩu mới cho tài khoản của bạn
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.password}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, password: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {passwords.password && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Ít nhất 8 ký tự', 'Ít nhất 1 chữ hoa', 'Ít nhất 1 chữ thường', 'Ít nhất 1 số'].map(
                          (req) => (
                            <span
                              key={req}
                              className={`inline-flex items-center gap-1 text-xs ${
                                !passwordIssues.includes(req)
                                  ? 'text-green-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {!passwordIssues.includes(req) ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              {req}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {passwords.confirmPassword &&
                      passwords.password === passwords.confirmPassword && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Mật khẩu khớp
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
