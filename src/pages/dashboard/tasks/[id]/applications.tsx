import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  ExternalLink,
  Star,
  Calendar,
  Briefcase,
  Loader2,
  AlertCircle,
  User,
  Award,
  TrendingUp,
} from 'lucide-react';

export default function TaskApplicationsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  const { data, isLoading } = useQuery({
    queryKey: ['task-applications', id, statusFilter],
    queryFn: () =>
      api
        .get(`/tasks/${id}/applications`, { params: { status: statusFilter || undefined } })
        .then((res) => res.data),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { id: string; status: 'APPROVED' | 'REJECTED'; feedback?: string }) =>
      api.post(`/applications/${data.id}/review`, {
        status: data.status,
        feedback: data.feedback,
      }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'APPROVED'
          ? 'Đã duyệt đơn ứng tuyển!'
          : 'Đã từ chối đơn ứng tuyển'
      );
      setShowReviewModal(false);
      setSelectedApplication(null);
      setReviewFeedback('');
      queryClient.invalidateQueries({ queryKey: ['task-applications', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const handleReview = (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedApplication) return;
    reviewMutation.mutate({
      id: selectedApplication.id,
      status: action,
      feedback: reviewFeedback || undefined,
    });
  };

  const openReviewModal = (application: any, action: 'APPROVED' | 'REJECTED') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewFeedback('');
    setShowReviewModal(true);
  };

  if (session?.user?.role === 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="mb-4 text-slate-400">Chỉ doanh nghiệp chủ task mới xem đơn ứng tuyển</p>
          <Link href="/dashboard" className="text-accent-400 hover:text-accent-300">
            ← Quay lại Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role === 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">Không có quyền truy cập</h2>
          <p className="mb-4 max-w-md text-center text-slate-400">
            Admin không xem nội dung đơn ứng tuyển. Bạn vẫn xem thông tin task cơ bản tại Quản lý
            Tasks hoặc trang chi tiết task công khai.
          </p>
          <Link href="/dashboard/tasks" className="text-accent-400 hover:text-accent-300">
            ← Quản lý Tasks
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </DashboardLayout>
    );
  }

  const applications = data?.data || [];
  const task = data?.task;

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
    return badges[status] || { label: status, class: 'bg-white/10 text-slate-400', icon: Clock };
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Đơn ứng tuyển - {task?.title || 'Task'} - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/tasks"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách tasks
          </Link>
          <h1 className="page-title">Đơn ứng tuyển</h1>
          {task && (
            <p className="mt-1 text-slate-400">
              Task: <span className="font-medium text-slate-300">{task.title}</span>
              <span className="mx-2">•</span>
              Slots: {task.currentAssignees}/{task.maxAssignees}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/5 p-2">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Tổng đơn</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Hourglass className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                <p className="text-sm text-slate-400">Chờ duyệt</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                <p className="text-sm text-slate-400">Đã duyệt</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
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

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
            <Users className="mb-4 h-16 w-16 text-slate-600" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              Chưa có đơn ứng tuyển
            </h3>
            <p className="text-slate-400">
              Các ứng viên sẽ xuất hiện ở đây khi họ ứng tuyển
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application: any) => {
              const badge = getStatusBadge(application.status);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={application.id}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Applicant Info */}
                    <div className="flex-1">
                      <div className="mb-4 flex items-start gap-4">
                        {application.applicant.avatar ? (
                          <Image
                            src={application.applicant.avatar}
                            alt={application.applicant.name}
                            width={56}
                            height={56}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/20 text-xl font-semibold text-accent-400">
                            {application.applicant.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">
                              {application.applicant.name}
                            </h3>
                            {application.applicant.isVerified && (
                              <CheckCircle className="h-4 w-4 text-blue-400" />
                            )}
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.class}`}>
                              <BadgeIcon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {application.applicant.email}
                          </p>
                          {application.applicant.username && (
                            <Link
                              href={`/users/${application.applicant.username}`}
                              className="inline-flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300"
                            >
                              Xem profile <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mb-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Award className="h-4 w-4" />
                          <span>{application.applicantStats.totalSubmissions} submissions</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <TrendingUp className="h-4 w-4" />
                          <span>{application.applicantStats.successRate}% thành công</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Tham gia:{' '}
                            {new Date(application.applicant.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      <div className="mb-4">
                        <h4 className="mb-2 text-sm font-medium text-slate-300">
                          Giới thiệu:
                        </h4>
                        <p className="whitespace-pre-wrap text-sm text-slate-400">
                          {application.coverLetter}
                        </p>
                      </div>

                      {/* Experience */}
                      {application.experience && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-medium text-slate-300">
                            Kinh nghiệm:
                          </h4>
                          <p className="text-sm text-slate-400">{application.experience}</p>
                        </div>
                      )}

                      {/* Portfolio Links */}
                      {application.portfolioLinks?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-medium text-slate-300">
                            Portfolio:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {application.portfolioLinks.map((link: string, idx: number) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {new URL(link).hostname}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expected Days */}
                      {application.expectedDays && (
                        <p className="text-sm text-slate-500">
                          <Clock className="mr-1 inline h-4 w-4" />
                          Dự kiến hoàn thành: {application.expectedDays} ngày
                        </p>
                      )}

                      {/* Applied date */}
                      <p className="mt-2 text-xs text-slate-500">
                        Ứng tuyển: {new Date(application.appliedAt).toLocaleString('vi-VN')}
                      </p>

                      {/* Feedback (if reviewed) */}
                      {application.feedback && (
                        <div className="mt-4 rounded-lg bg-white/5 p-3">
                          <p className="mb-1 text-xs font-medium text-slate-500">
                            Phản hồi của bạn:
                          </p>
                          <p className="text-sm text-slate-300">{application.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {application.status === 'PENDING' && (
                      <div className="flex gap-2 lg:flex-col">
                        <button
                          onClick={() => openReviewModal(application, 'APPROVED')}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Duyệt
                        </button>
                        <button
                          onClick={() => openReviewModal(application, 'REJECTED')}
                          className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-card w-full max-w-md rounded-xl p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              {reviewAction === 'APPROVED' ? 'Duyệt đơn ứng tuyển' : 'Từ chối đơn ứng tuyển'}
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Ứng viên: <strong className="text-white">{selectedApplication.applicant.name}</strong>
            </p>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Phản hồi {reviewAction === 'REJECTED' ? '(nên ghi lý do)' : '(tùy chọn)'}
              </label>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={3}
                className="input-premium w-full"
                placeholder={
                  reviewAction === 'APPROVED'
                    ? 'Ví dụ: Chào mừng bạn đến với dự án!'
                    : 'Ví dụ: Cảm ơn bạn đã ứng tuyển, nhưng chúng tôi cần ứng viên có kinh nghiệm hơn...'
                }
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReview(reviewAction)}
                disabled={reviewMutation.isPending}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                  reviewAction === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewMutation.isPending
                  ? 'Đang xử lý...'
                  : reviewAction === 'APPROVED'
                  ? 'Xác nhận duyệt'
                  : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
