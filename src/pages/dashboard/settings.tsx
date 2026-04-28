import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/user/change-password', data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    if (password.length < 8) {
      issues.push('Ít nhất 8 ký tự');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('Ít nhất 1 chữ hoa');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('Ít nhất 1 chữ thường');
    }
    if (!/[0-9]/.test(password)) {
      issues.push('Ít nhất 1 số');
    }
    return issues;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    const passwordIssues = validatePassword(passwords.newPassword);
    if (passwordIssues.length > 0) {
      newErrors.newPassword = 'Mật khẩu chưa đủ mạnh';
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      changePasswordMutation.mutate({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
    }
  };

  const passwordStrength = validatePassword(passwords.newPassword);
  const isStrongPassword = passwordStrength.length === 0 && passwords.newPassword.length > 0;

  return (
    <DashboardLayout>
      <Head>
        <title>Cài đặt - VEarn</title>
      </Head>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Cài đặt</h1>
          <p className="mt-1 text-slate-400">
            Quản lý tài khoản và bảo mật
          </p>
        </div>

        {/* Change Password Section */}
        <div className="glass-card rounded-xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/20 p-2">
              <Lock className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Đổi mật khẩu</h2>
              <p className="text-sm text-slate-400">
                Cập nhật mật khẩu để bảo vệ tài khoản
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  className={`input-premium w-full pr-10 ${
                    errors.currentPassword
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : ''
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  className={`input-premium w-full pr-10 ${
                    errors.newPassword
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : ''
                  }`}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
              )}

              {/* Password strength indicator */}
              {passwords.newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          4 - passwordStrength.length >= i
                            ? isStrongPassword
                              ? 'bg-emerald-500'
                              : 4 - passwordStrength.length >= 3
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Ít nhất 8 ký tự', 'Ít nhất 1 chữ hoa', 'Ít nhất 1 chữ thường', 'Ít nhất 1 số'].map(
                      (req) => (
                        <span
                          key={req}
                          className={`inline-flex items-center gap-1 text-xs ${
                            !passwordStrength.includes(req)
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {!passwordStrength.includes(req) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {req}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  className={`input-premium w-full pr-10 ${
                    errors.confirmPassword
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : ''
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
              {passwords.confirmPassword &&
                passwords.newPassword === passwords.confirmPassword && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    Mật khẩu khớp
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-primary mt-2 flex w-full items-center justify-center gap-2"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 font-semibold text-white">Thông tin tài khoản</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span className="text-sm text-slate-400">Email</span>
              <span className="font-medium text-white">{session?.user?.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span className="text-sm text-slate-400">Loại tài khoản</span>
              <span className="badge-accent">
                {session?.user?.role === 'CONTRIBUTOR' && 'Cộng tác viên'}
                {session?.user?.role === 'BUSINESS' && 'Doanh nghiệp'}
                {session?.user?.role === 'ADMIN' && 'Quản trị viên'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
