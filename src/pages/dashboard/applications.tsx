import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Send,
  Hourglass,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export default function MyApplicationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', statusFilter],
    queryFn: () =>
      api
        .get('/applications/my', { params: { status: statusFilter || undefined } })
        .then((res) => res.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}/apply`),
    onSuccess: () => {
      toast.success('Đã hủy đơn ứng tuyển');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  // Access control
  if (session?.user?.role !== 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="mb-4 text-slate-400">
            Trang này chỉ dành cho Contributor
          </p>
          <Link href="/dashboard" className="text-accent-400 hover:text-accent-300">
            ← Quay lại Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const applications = data || [];

  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status === 'PENDING').length,
    approved: applications.filter((a: any) => a.status === 'APPROVED').length,
    rejected: applications.filter((a: any) => a.status === 'REJECTED').length,
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string; icon: any }> = {
      PENDING: {
        label: 'Chờ duyệt',
        class: 'badge-amber',
        icon: Hourglass,
      },
      APPROVED: {
        label: 'Đã duyệt',
        class: 'badge-emerald',
        icon: CheckCircle,
      },
      REJECTED: {
        label: 'Từ chối',
        class: 'badge-rose',
        icon: XCircle,
      },
    };
    return badges[status] || { label: status, class: 'bg-white/10 text-slate-300', icon: Clock };
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Đơn ứng tuyển của tôi - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Đơn ứng tuyển của tôi</h1>
          <p className="mt-1 text-slate-400">
            Theo dõi trạng thái các đơn ứng tuyển task
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <Send className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Tổng đơn</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2">
                <Hourglass className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                <p className="text-sm text-slate-400">Chờ duyệt</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
                <p className="text-sm text-slate-400">Đã duyệt</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-500/20 p-2">
                <XCircle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-400">{stats.rejected}</p>
                <p className="text-sm text-slate-400">Từ chối</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-premium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && applications.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
            <Send className="mb-4 h-16 w-16 text-slate-600" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              Chưa có đơn ứng tuyển
            </h3>
            <p className="mb-4 text-slate-400">
              Khám phá các tasks và bắt đầu ứng tuyển!
            </p>
            <Link
              href="/tasks"
              className="btn-primary"
            >
              Khám phá Tasks
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map((application: any) => {
              const badge = getStatusBadge(application.status);
              const BadgeIcon = badge.icon;
              const daysLeft = application.task.deadline
                ? Math.ceil(
                    (new Date(application.task.deadline).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <div
                  key={application.id}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      {/* Task info */}
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <Link
                            href={`/tasks/${application.task.slug}`}
                            className="text-lg font-semibold text-white hover:text-accent-400"
                          >
                            {application.task.title}
                          </Link>
                          {application.task.category && (
                            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                              {application.task.category}
                            </span>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badge.class}`}
                        >
                          <BadgeIcon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      </div>

                      {/* Task meta */}
                      <div className="mb-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-emerald-400">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">
                            {new Intl.NumberFormat('vi-VN').format(application.task.reward)}đ
                          </span>
                        </div>
                        {daysLeft !== null && (
                          <div
                            className={`flex items-center gap-1 ${
                              daysLeft <= 3 ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>
                              {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết hạn'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            Ứng tuyển:{' '}
                            {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {/* Business info */}
                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                        <span>Đăng bởi:</span>
                        <span className="font-medium text-slate-300">{application.task.creator?.name}</span>
                      </div>

                      {/* Cover letter preview */}
                      <p className="line-clamp-2 text-sm text-slate-400">
                        {application.coverLetter}
                      </p>

                      {/* Feedback (if rejected) */}
                      {application.status === 'REJECTED' && application.feedback && (
                        <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
                          <p className="mb-1 text-xs font-medium text-rose-400">Lý do từ chối:</p>
                          <p className="text-sm text-rose-300">{application.feedback}</p>
                        </div>
                      )}

                      {/* Feedback (if approved) */}
                      {application.status === 'APPROVED' && application.feedback && (
                        <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                          <p className="mb-1 text-xs font-medium text-emerald-400">
                            Phản hồi từ doanh nghiệp:
                          </p>
                          <p className="text-sm text-emerald-300">{application.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:flex-col">
                      <Link
                        href={`/tasks/${application.task.slug}`}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem task
                      </Link>

                      {application.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn hủy đơn ứng tuyển này?')) {
                              cancelMutation.mutate(application.taskId);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hủy đơn
                        </button>
                      )}

                      {application.status === 'APPROVED' && (
                        <Link
                          href={`/tasks/${application.task.slug}`}
                          className="btn-primary flex items-center gap-1 text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Làm task
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
