import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ArrowLeft,
  Check,
  X,
  MessageSquare,
  ExternalLink,
  FileText,
  Download,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const submissionId = typeof id === 'string' ? id : '';
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedForReview, setSelectedForReview] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () =>
      api.get(`/submissions/${submissionId}`).then((res) => res.data.data),
    enabled: !!submissionId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      api.post(`/submissions/${submissionId}/review`, { status, feedback }),
    onSuccess: () => {
      toast.success('Đã cập nhật submission');
      setSelectedForReview(false);
      setFeedback('');
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const isBusiness = session?.user?.role === 'BUSINESS';

  if (isLoading || !router.isReady) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <Head>
          <title>Không tìm thấy - VEarn</title>
        </Head>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-14 w-14 text-amber-400" />
          <p className="mb-4 text-slate-400">Không tìm thấy submission hoặc không có quyền xem.</p>
          <Link href="/dashboard/submissions" className="text-accent-400 hover:text-accent-300">
            ← Quay lại Submissions
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const s = data as {
    id: string;
    content: string;
    links: string[];
    fileUrls: string[];
    status: string;
    feedback: string | null;
    submittedAt: string;
    reviewedAt: string | null;
    contributor: {
      id: string;
      name: string | null;
      avatar: string | null;
      email: string | null;
    };
    task: {
      id: string;
      title: string;
      slug: string | null;
      reward: number;
      creatorId: string;
    };
  };

  return (
    <DashboardLayout>
      <Head>
        <title>{s.task.title} — Submission - VEarn</title>
      </Head>

      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/submissions"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Submissions
          </Link>
          <div className="glass-card rounded-xl p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tasks/${s.task.slug || s.task.id}`}
                  className="text-lg font-semibold text-white hover:text-accent-400"
                >
                  {s.task.title}
                </Link>
                <p className="mt-1 text-sm text-slate-400">
                  Nộp lúc{' '}
                  {new Date(s.submittedAt).toLocaleString('vi-VN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={s.status} />
                <span className="text-sm font-medium text-emerald-400">
                  {new Intl.NumberFormat('vi-VN').format(s.task.reward)} đ
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
              {s.contributor.avatar ? (
                <Image
                  src={s.contributor.avatar}
                  alt={s.contributor.name || ''}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-600 text-sm font-medium text-white">
                  {s.contributor.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-white">{s.contributor.name}</p>
                <p className="text-xs text-slate-500">{s.contributor.email}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-white/5 p-4">
              <p className="mb-2 text-xs font-medium text-slate-400">Nội dung</p>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{s.content}</p>
            </div>

            {s.fileUrls?.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-slate-400">
                  File đính kèm ({s.fileUrls.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {s.fileUrls.map((url: string, i: number) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    const fileName = url.split('/').pop() || `File ${i + 1}`;
                    return (
                      <div
                        key={i}
                        className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                      >
                        {isImage ? (
                          <div className="relative">
                            <Image
                              src={url}
                              alt={fileName}
                              width={400}
                              height={200}
                              className="h-40 w-full object-cover"
                            />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </div>
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 hover:bg-white/5"
                          >
                            <FileText className="h-8 w-8 shrink-0 text-slate-400" />
                            <span className="flex-1 truncate text-sm text-slate-300">{fileName}</span>
                            <Download className="h-4 w-4 shrink-0 text-slate-400" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {s.links?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {s.links.map((link: string, i: number) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-accent-500/10 px-3 py-1.5 text-sm text-accent-400 hover:bg-accent-500/20"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Link {i + 1}
                  </a>
                ))}
              </div>
            )}

            {s.feedback && (
              <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
                <MessageSquare className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-400">Phản hồi</p>
                  <p className="text-sm text-slate-300">{s.feedback}</p>
                </div>
              </div>
            )}

            {isBusiness && s.status === 'PENDING' && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => setSelectedForReview(true)}
                  className="rounded-lg bg-accent-500/15 px-4 py-2 text-sm font-medium text-accent-300 ring-1 ring-accent-500/30 hover:bg-accent-500/25"
                >
                  Duyệt / từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Duyệt submission</h2>
            <p className="mb-4 text-sm text-slate-400">Task: {s.task.title}</p>
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
                type="button"
                onClick={() => reviewMutation.mutate({ status: 'APPROVED' })}
                disabled={reviewMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Duyệt
              </button>
              <button
                type="button"
                onClick={() => reviewMutation.mutate({ status: 'REJECTED' })}
                disabled={reviewMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Từ chối
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedForReview(false);
                setFeedback('');
              }}
              className="mt-3 w-full rounded-lg border border-white/10 py-2.5 font-medium text-slate-300 hover:bg-white/5"
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
  const styles: Record<string, string> = {
    PENDING: 'badge-amber',
    APPROVED: 'badge-emerald',
    REJECTED: 'badge-rose',
  };
  const labels: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  };
  return (
    <span className={styles[status] || 'rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300'}>
      {labels[status] || status}
    </span>
  );
}
