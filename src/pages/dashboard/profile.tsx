import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  AtSign,
  FileText,
  Calendar,
  Shield,
  CheckCircle,
  Camera,
  Save,
  Loader2,
  Upload,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    phone: '',
    avatar: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/user/profile').then((res) => res.data.data),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put('/user/profile', data),
    onSuccess: (response) => {
      toast.success('Cập nhật thông tin thành công!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (response.data.data.name !== session?.user?.name) {
        updateSession({ name: response.data.data.name });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh.');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await api.post('/upload', {
            file: base64,
            filename: file.name,
            type: file.type,
          });

          if (response.data.url) {
            setFormData((prev) => ({ ...prev, avatar: response.data.url }));
            toast.success('Upload ảnh thành công!');
          }
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Lỗi khi upload ảnh');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Lỗi khi đọc file');
      setIsUploading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: { label: 'Quản trị viên', color: 'badge-rose' },
      BUSINESS: { label: 'Doanh nghiệp', color: 'badge-accent' },
      CONTRIBUTOR: { label: 'Cộng tác viên', color: 'badge-emerald' },
    };
    return badges[role as keyof typeof badges] || badges.CONTRIBUTOR;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </DashboardLayout>
    );
  }

  const badge = getRoleBadge(profile?.role);

  return (
    <DashboardLayout>
      <Head>
        <title>Hồ sơ cá nhân - VEarn</title>
      </Head>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Hồ sơ cá nhân</h1>
          <p className="mt-1 text-slate-400">
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {formData.avatar ? (
                    <Image
                      src={formData.avatar}
                      alt={formData.name}
                      width={120}
                      height={120}
                      className="h-28 w-28 rounded-full object-cover ring-4 ring-accent-500/20"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-600 text-3xl font-bold text-white ring-4 ring-accent-500/20">
                      {formData.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 rounded-full bg-white/10 p-2 shadow-lg transition hover:bg-white/20 disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
                    ) : (
                      <Camera className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-white">
                  {profile?.name}
                </h2>
                {profile?.username && (
                  <p className="text-slate-400">@{profile.username}</p>
                )}

                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${badge.color}`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {badge.label}
                  </span>
                </div>

                {profile?.isVerified && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    Đã xác minh
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profile?._count?.assignedTasks || 0}
                  </div>
                  <div className="text-xs text-slate-400">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profile?._count?.submissions || 0}
                  </div>
                  <div className="text-xs text-slate-400">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profile?._count?.createdTasks || 0}
                  </div>
                  <div className="text-xs text-slate-400">Đã tạo</div>
                </div>
              </div>

              {/* Member since */}
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                Tham gia từ{' '}
                {new Date(profile?.createdAt).toLocaleDateString('vi-VN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>

              {/* View Public Profile */}
              {profile?.username && (
                <Link
                  href={`/users/${profile.username}`}
                  target="_blank"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem trang cá nhân công khai
                </Link>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-6 text-lg font-semibold text-white">
                  Thông tin cơ bản
                </h3>

                <div className="space-y-5">
                  {/* Email (readonly) */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="input-premium w-full opacity-50"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Email không thể thay đổi
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <User className="h-4 w-4" />
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      minLength={2}
                      maxLength={100}
                      className="input-premium w-full"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <AtSign className="h-4 w-4" />
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      minLength={3}
                      maxLength={30}
                      pattern="^[a-zA-Z0-9_]+$"
                      className="input-premium w-full"
                      placeholder="username_cua_ban"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Chỉ chứa chữ cái, số và dấu gạch dưới
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      className="input-premium w-full"
                      placeholder="0912 345 678"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <FileText className="h-4 w-4" />
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      maxLength={500}
                      className="input-premium w-full resize-none"
                      placeholder="Viết vài dòng giới thiệu về bản thân..."
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {formData.bio.length}/500 ký tự
                    </p>
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Camera className="h-4 w-4" />
                      Ảnh đại diện
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Chọn ảnh
                          </>
                        )}
                      </button>
                      {formData.avatar && (
                        <span className="text-sm text-emerald-400">
                          ✓ Đã có ảnh
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Định dạng: JPG, PNG, GIF, WebP. Tối đa 5MB.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
