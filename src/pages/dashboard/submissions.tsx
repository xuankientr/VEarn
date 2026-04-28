import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EmptyTasksIllustration } from '@/components/illustrations';
import {
  ExternalLink,
  Check,
  X,
  MessageSquare,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function SubmissionsPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const canListSubmissions =
    session?.user?.role === 'CONTRIBUTOR' || session?.user?.role === 'BUSINESS';

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', filter],
    queryFn: () =>
      api
        .get('/submissions', {
          params: { status: filter || undefined, limit: 50 },
        })
        .then((res) => res.data),
    enabled: !!session?.user && canListSubmissions,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.post(`/submissions/${id}/review`, { status, feedback }),
    onSuccess: () => {
      toast.success('Đã duyệt submission');
      setSelectedSubmission(null);
      setFeedback('');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const submissions = data?.data || [];
  const isBusiness = session?.user?.role === 'BUSINESS';
  const isContributor = session?.user?.role === 'CONTRIBUTOR';

  if (session?.user?.role === 'ADMIN') {
    return (
      <DashboardLayout>
        <Head>
          <title>Submissions - VEarn</title>
        </Head>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">Không có quyền truy cập</h2>
          <p className="mb-4 max-w-md text-center text-slate-400">
            Admin không xem danh sách submission chi tiết. Dùng mục Thống kê trong Quản trị để xem số
            liệu tổng hợp.
          </p>
          <Link href="/dashboard/admin/stats" className="text-accent-400 hover:text-accent-300">
            → Thống kê hệ thống
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const filteredSubmissions = submissions.filter(
    (s: any) =>
      s.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contributor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s: any) => s.status === 'PENDING').length,
    approved: submissions.filter((s: any) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Submissions - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Submissions</h1>
          <p className="mt-1 text-slate-400">
            {isContributor
              ? 'Theo dõi trạng thái các bài nộp của bạn'
              : 'Duyệt và quản lý bài nộp từ cộng tác viên'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/5 p-2">
                <MessageSquare className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Tổng cộng</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                <p className="text-xs text-slate-400">Chờ duyệt</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
                <p className="text-xs text-slate-400">Đã duyệt</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-500/10 p-2">
                <XCircle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-400">{stats.rejected}</p>
                <p className="text-xs text-slate-400">Từ chối</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên task hoặc người nộp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium w-full pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-premium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
            <EmptyTasksIllustration className="mb-6 h-40 w-40" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {searchQuery ? 'Không tìm thấy' : 'Chưa có submission nào'}
            </h3>
            <p className="text-slate-400">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : isContributor
                ? 'Nhận task và nộp bài để xem tại đây'
                : 'Submissions từ cộng tác viên sẽ hiển thị tại đây'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission: any) => (
              <div
                key={submission.id}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Task title */}
                    <Link
                      href={`/tasks/${submission.task.slug || submission.task.id}`}
                      className="font-semibold text-white hover:text-accent-400"
                    >
                      {submission.task.title}
                    </Link>

                    {/* Contributor info */}
                    <div className="mt-2 flex items-center gap-3">
                      {submission.contributor?.avatar ? (
                        <Image
                          src={submission.contributor.avatar}
                          alt={submission.contributor.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-600 text-sm font-medium text-white">
                          {submission.contributor?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          {submission.contributor?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(submission.submittedAt).toLocaleString(
                            'vi-VN'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Content preview */}
                    <div className="mt-3 rounded-lg bg-white/5 p-3">
                      <p className="whitespace-pre-wrap text-sm text-slate-400">
                        {submission.content.slice(0, 300)}
                        {submission.content.length > 300 && '...'}
                      </p>
                    </div>

                    {/* File Attachments */}
                    {submission.fileUrls?.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-medium text-slate-400">
                          File đính kèm ({submission.fileUrls.length})
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {submission.fileUrls.map((url: string, i: number) => {
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                            const fileName = url.split('/').pop() || `File ${i + 1}`;
                            
                            return (
                              <div
                                key={i}
                                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5"
                              >
                                {isImage ? (
                                  <>
                                    <Image
                                      src={url}
                                      alt={fileName}
                                      width={200}
                                      height={120}
                                      className="h-24 w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </a>
                                      <a
                                        href={url}
                                        download
                                        className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                  </>
                                ) : (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 hover:bg-white/5"
                                  >
                                    <FileText className="h-8 w-8 text-slate-400" />
                                    <span className="flex-1 truncate text-sm text-slate-300">
                                      {fileName}
                                    </span>
                                    <Download className="h-4 w-4 text-slate-400" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {submission.links?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {submission.links.map((link: string, i: number) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-accent-500/10 px-2 py-1 text-xs text-accent-400 hover:bg-accent-500/20"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link {i + 1}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Feedback */}
                    {submission.feedback && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                        <MessageSquare className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Phản hồi
                          </p>
                          <p className="text-sm text-slate-300">
                            {submission.feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="ml-4 flex flex-col items-end gap-3">
                    <StatusBadge status={submission.status} />

                    {/* Review actions */}
                    {isBusiness && submission.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/5"
                        >
                          Duyệt
                        </button>
                      </div>
                    )}

                    {/* Reward */}
                    <p className="text-sm font-medium text-emerald-400">
                      {new Intl.NumberFormat('vi-VN').format(
                        submission.task.reward
                      )}{' '}
                      VND
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card mx-4 w-full max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Duyệt Submission
            </h2>

            <p className="mb-4 text-sm text-slate-400">
              Task: {selectedSubmission.task.title}
            </p>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Phản hồi (tuỳ chọn)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="input-premium w-full"
                placeholder="Nhập phản hồi cho cộng tác viên..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  reviewMutation.mutate({
                    id: selectedSubmission.id,
                    status: 'APPROVED',
                  })
                }
                disabled={reviewMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Duyệt
              </button>
              <button
                onClick={() =>
                  reviewMutation.mutate({
                    id: selectedSubmission.id,
                    status: 'REJECTED',
                  })
                }
                disabled={reviewMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Từ chối
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedSubmission(null);
                setFeedback('');
              }}
              className="mt-3 w-full rounded-lg border border-white/10 py-2.5 font-medium text-slate-300 transition hover:bg-white/5"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: 'badge-amber',
    APPROVED: 'badge-emerald',
    REJECTED: 'badge-rose',
  };

  const labels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        styles[status as keyof typeof styles] || 'bg-white/5 text-slate-300'
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
