import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { EmptyTasksIllustration } from '@/components/illustrations';
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  ExternalLink,
  FileText,
  Loader2,
  Filter,
} from 'lucide-react';

type TabType = 'claimed' | 'submitted' | 'completed';

export default function MyTasksPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('claimed');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: claimedData, isLoading: loadingClaimed } = useQuery({
    queryKey: ['my-claimed-tasks'],
    queryFn: () => api.get('/user/claimed-tasks').then((res) => res.data),
  });

  const { data: submissionsData, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => api.get('/submissions/my').then((res) => res.data),
  });

  const claimedTasks = claimedData?.data || [];
  const submissions = submissionsData?.data || [];

  const submittedSubmissions = submissions.filter(
    (s: any) => s.status === 'PENDING'
  );
  const completedSubmissions = submissions.filter(
    (s: any) => s.status === 'APPROVED' || s.status === 'REJECTED'
  );

  const filterBySearch = (items: any[], key: string) => {
    if (!searchQuery) return items;
    return items.filter((item: any) =>
      (item[key] || item.task?.[key] || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  };

  const filteredClaimed = filterBySearch(claimedTasks, 'title');
  const filteredSubmitted = filterBySearch(submittedSubmissions, 'title');
  const filteredCompleted = filterBySearch(completedSubmissions, 'title');

  const isLoading = loadingClaimed || loadingSubmissions;

  const tabs = [
    {
      id: 'claimed' as TabType,
      label: 'Đang làm',
      count: claimedTasks.length,
      icon: Clock,
    },
    {
      id: 'submitted' as TabType,
      label: 'Đã nộp',
      count: submittedSubmissions.length,
      icon: FileText,
    },
    {
      id: 'completed' as TabType,
      label: 'Hoàn thành',
      count: completedSubmissions.length,
      icon: CheckCircle,
    },
  ];

  if (session?.user?.role !== 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Dành cho Contributor
          </h2>
          <p className="mb-4 text-slate-400">
            Trang này chỉ dành cho tài khoản Contributor
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
        <title>Tasks của tôi - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Tasks của tôi</h1>
          <p className="mt-1 text-slate-400">
            Theo dõi các tasks bạn đã nhận và tiến độ công việc
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-500/10 p-2">
                <Clock className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {claimedTasks.length}
                </p>
                <p className="text-xs text-slate-400">Đang làm</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {submittedSubmissions.length}
                </p>
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
                <p className="text-2xl font-bold text-white">
                  {completedSubmissions.filter((s: any) => s.status === 'APPROVED').length}
                </p>
                <p className="text-xs text-slate-400">Hoàn thành</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium w-full pl-9 sm:w-64"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : (
          <>
            {/* Claimed Tasks */}
            {activeTab === 'claimed' && (
              <div className="space-y-4">
                {filteredClaimed.length === 0 ? (
                  <EmptyState
                    title={searchQuery ? 'Không tìm thấy' : 'Chưa nhận task nào'}
                    description={
                      searchQuery
                        ? 'Thử tìm kiếm với từ khóa khác'
                        : 'Bắt đầu nhận task để kiếm tiền!'
                    }
                    action={
                      !searchQuery && (
                        <Link
                          href="/tasks"
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          Khám phá Tasks
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )
                    }
                  />
                ) : (
                  filteredClaimed.map((task: any) => (
                    <TaskCard key={task.id} task={task} type="claimed" />
                  ))
                )}
              </div>
            )}

            {/* Submitted */}
            {activeTab === 'submitted' && (
              <div className="space-y-4">
                {filteredSubmitted.length === 0 ? (
                  <EmptyState
                    title={searchQuery ? 'Không tìm thấy' : 'Chưa có bài nộp'}
                    description={
                      searchQuery
                        ? 'Thử tìm kiếm với từ khóa khác'
                        : 'Hoàn thành task và nộp bài để nhận thưởng'
                    }
                  />
                ) : (
                  filteredSubmitted.map((submission: any) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                    />
                  ))
                )}
              </div>
            )}

            {/* Completed */}
            {activeTab === 'completed' && (
              <div className="space-y-4">
                {filteredCompleted.length === 0 ? (
                  <EmptyState
                    title={searchQuery ? 'Không tìm thấy' : 'Chưa có kết quả'}
                    description={
                      searchQuery
                        ? 'Thử tìm kiếm với từ khóa khác'
                        : 'Các submissions đã duyệt sẽ hiển thị ở đây'
                    }
                  />
                ) : (
                  filteredCompleted.map((submission: any) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      showResult
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function TaskCard({ task, type }: { task: any; type: 'claimed' }) {
  return (
    <div className="glass-card rounded-xl p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/tasks/${task.slug}`}
            className="text-lg font-semibold text-white hover:text-accent-400"
          >
            {task.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
            {task.description?.slice(0, 150)}...
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN').format(task.reward)} đ
              </span>
            </div>
            {task.deadline && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
            {task.category && (
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                {task.category}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/tasks/${task.slug}`}
          className="btn-primary shrink-0"
        >
          Nộp bài
        </Link>
      </div>
    </div>
  );
}

function SubmissionCard({
  submission,
  showResult,
}: {
  submission: any;
  showResult?: boolean;
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
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/tasks/${submission.task?.slug}`}
              className="text-lg font-semibold text-white hover:text-accent-400"
            >
              {submission.task?.title}
            </Link>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusStyles[submission.status as keyof typeof statusStyles]
              }`}
            >
              {statusLabels[submission.status as keyof typeof statusLabels]}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
            {submission.content?.slice(0, 150)}...
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN').format(
                  submission.task?.reward || 0
                )}{' '}
                đ
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>
                Nộp lúc:{' '}
                {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {submission.fileUrls?.length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <FileText className="h-4 w-4" />
                <span>{submission.fileUrls.length} file đính kèm</span>
              </div>
            )}
          </div>

          {showResult && submission.feedback && (
            <div
              className={`mt-3 rounded-lg p-3 ${
                submission.status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <p className="text-sm font-medium">Phản hồi:</p>
              <p className="text-sm">{submission.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
      <EmptyTasksIllustration className="mb-6 h-40 w-40" />
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-4 text-slate-400">{description}</p>
      {action}
    </div>
  );
}
