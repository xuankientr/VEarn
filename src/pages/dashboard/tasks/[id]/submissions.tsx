import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { EmptyTasksIllustration } from '@/components/illustrations';
import {
  ArrowLeft,
  Check,
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  FileText,
  Download,
  Eye,
  ExternalLink,
  AlertCircle,
  User,
} from 'lucide-react';

export default function TaskSubmissionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('');

  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ['task-detail', id],
    queryFn: () => api.get(`/tasks/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });

  const { data: submissionsData, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['task-submissions', id, filter],
    queryFn: () =>
      api
        .get(`/tasks/${id}/submissions`, {
          params: { status: filter || undefined },
        })
        .then((res) => res.data),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ submissionId, status }: { submissionId: string; status: string }) =>
      api.post(`/submissions/${submissionId}/review`, { status, feedback }),
    onSuccess: () => {
      toast.success('Đã duyệt submission');
      setSelectedSubmission(null);
      setFeedback('');
      queryClient.invalidateQueries({ queryKey: ['task-submissions', id] });
      queryClient.invalidateQueries({ queryKey: ['task-detail', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const submissions = submissionsData?.data || [];
  const isLoading = loadingTask || loadingSubmissions;

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s: any) => s.status === 'PENDING').length,
    approved: submissions.filter((s: any) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
  };

  const isOwner = session?.user?.id === task?.creatorId;

  if (!isLoading && task && !isOwner) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="mb-4 text-slate-400">
            Bạn không có quyền xem submissions của task này
          </p>
          <Link
            href="/dashboard"
            className="text-accent-400 hover:text-accent-300"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Submissions - {task?.title || 'Task'} - VEarn</title>
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

          {task && (
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {task.title}
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Xem và duyệt submissions từ cộng tác viên
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('vi-VN').format(task.reward)} đ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<MessageSquare className="h-5 w-5 text-slate-400" />}
            label="Tổng submissions"
            value={stats.total}
            bgColor="bg-white/5"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-yellow-400" />}
            label="Chờ duyệt"
            value={stats.pending}
            bgColor="bg-yellow-500/10"
            textColor="text-yellow-400"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-green-400" />}
            label="Đã duyệt"
            value={stats.approved}
            bgColor="bg-green-500/10"
            textColor="text-green-400"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5 text-red-400" />}
            label="Từ chối"
            value={stats.rejected}
            bgColor="bg-red-500/10"
            textColor="text-red-400"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[
            { value: '', label: 'Tất cả' },
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'APPROVED', label: 'Đã duyệt' },
            { value: 'REJECTED', label: 'Từ chối' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === opt.value
                  ? 'bg-accent-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
            <EmptyTasksIllustration className="mb-6 h-40 w-40" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              Chưa có submission nào
            </h3>
            <p className="text-slate-400">
              Submissions từ cộng tác viên sẽ hiển thị tại đây
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission: any) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                onReview={() => {
                  setSelectedSubmission(submission);
                  setFeedback(submission.feedback || '');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Duyệt Submission
            </h2>

            {/* Contributor info */}
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-white/5 p-3">
              {selectedSubmission.contributor?.avatar ? (
                <Image
                  src={selectedSubmission.contributor.avatar}
                  alt={selectedSubmission.contributor.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-600 text-sm font-medium text-white">
                  {selectedSubmission.contributor?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-white">
                  {selectedSubmission.contributor?.name}
                </p>
                <p className="text-sm text-slate-400">
                  {selectedSubmission.contributor?.email}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Nội dung bài nộp
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="whitespace-pre-wrap text-sm text-slate-300">
                  {selectedSubmission.content}
                </p>
              </div>
            </div>

            {/* Files */}
            {selectedSubmission.fileUrls?.length > 0 && (
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  File đính kèm ({selectedSubmission.fileUrls.length})
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedSubmission.fileUrls.map((url: string, i: number) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    const fileName = url.split('/').pop() || `File ${i + 1}`;

                    return (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-lg border border-white/10"
                      >
                        {isImage ? (
                          <>
                            <Image
                              src={url}
                              alt={fileName}
                              width={200}
                              height={120}
                              className="h-32 w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </a>
                              <a
                                href={url}
                                download
                                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                              >
                                <Download className="h-4 w-4 text-white" />
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
                            <FileText className="h-8 w-8 text-slate-500" />
                            <span className="flex-1 truncate text-sm text-slate-300">
                              {fileName}
                            </span>
                            <Download className="h-4 w-4 text-slate-500" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Links */}
            {selectedSubmission.links?.length > 0 && (
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Links
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedSubmission.links.map((link: string, i: number) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-accent-500/10 px-3 py-1.5 text-sm text-accent-400 hover:bg-accent-500/20"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Link {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Phản hồi cho cộng tác viên
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="input-premium w-full"
                placeholder="Nhận xét, góp ý hoặc lý do từ chối..."
              />
            </div>

            {/* Actions */}
            {selectedSubmission.status === 'PENDING' ? (
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    reviewMutation.mutate({
                      submissionId: selectedSubmission.id,
                      status: 'APPROVED',
                    })
                  }
                  disabled={reviewMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Duyệt & Thanh toán
                </button>
                <button
                  onClick={() =>
                    reviewMutation.mutate({
                      submissionId: selectedSubmission.id,
                      status: 'REJECTED',
                    })
                  }
                  disabled={reviewMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Từ chối
                </button>
              </div>
            ) : (
              <div
                className={`rounded-lg p-3 text-center ${
                  selectedSubmission.status === 'APPROVED'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {selectedSubmission.status === 'APPROVED'
                  ? 'Submission đã được duyệt'
                  : 'Submission đã bị từ chối'}
              </div>
            )}

            <button
              onClick={() => {
                setSelectedSubmission(null);
                setFeedback('');
              }}
              className="btn-secondary mt-3 w-full"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  textColor = 'text-white',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  textColor?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${bgColor}`}>{icon}</div>
        <div>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({
  submission,
  onReview,
}: {
  submission: any;
  onReview: () => void;
}) {
  const statusStyles = {
    PENDING: 'badge-amber',
    APPROVED: 'badge-emerald',
    REJECTED: 'badge-rose',
  };

  const statusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  };

  return (
    <div className="glass-card rounded-xl p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Contributor */}
          <div className="flex items-center gap-3">
            {submission.contributor?.avatar ? (
              <Image
                src={submission.contributor.avatar}
                alt={submission.contributor.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-600 text-sm font-medium text-white">
                {submission.contributor?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-white">
                {submission.contributor?.name}
              </p>
              <p className="text-sm text-slate-400">
                Nộp lúc {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Content preview */}
          <div className="mt-3 rounded-lg bg-white/5 p-3">
            <p className="line-clamp-3 whitespace-pre-wrap text-sm text-slate-300">
              {submission.content}
            </p>
          </div>

          {/* Attachments info */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
            {submission.fileUrls?.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {submission.fileUrls.length} file
              </span>
            )}
            {submission.links?.length > 0 && (
              <span className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                {submission.links.length} link
              </span>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col items-end gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusStyles[submission.status as keyof typeof statusStyles]
            }`}
          >
            {statusLabels[submission.status as keyof typeof statusLabels]}
          </span>

          <button
            onClick={onReview}
            className="btn-secondary text-sm"
          >
            {submission.status === 'PENDING' ? 'Duyệt' : 'Xem chi tiết'}
          </button>
        </div>
      </div>
    </div>
  );
}
