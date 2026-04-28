import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';

export default function AdminStatsPage() {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((res) => res.data.data),
    enabled: session?.user?.role === 'ADMIN',
  });

  // Only Admin can access
  if (session?.user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-rose-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="text-slate-400">Chỉ Admin mới có thể truy cập trang này</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </DashboardLayout>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Thống kê hệ thống - VEarn Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Thống kê hệ thống</h1>
          <p className="mt-1 text-slate-400">
            Tổng quan hoạt động của nền tảng VEarn
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Tổng Users"
            value={stats?.users?.total || 0}
            subLabel={`${stats?.users?.contributors || 0} cộng tác viên, ${stats?.users?.business || 0} doanh nghiệp`}
            color="accent"
          />
          <StatCard
            icon={<Briefcase className="h-6 w-6" />}
            label="Tổng Tasks"
            value={stats?.tasks?.total || 0}
            subLabel={`${stats?.tasks?.open || 0} đang mở, ${stats?.tasks?.completed || 0} hoàn thành`}
            color="blue"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Submissions"
            value={stats?.submissions?.total || 0}
            subLabel={`${stats?.submissions?.pending || 0} chờ duyệt`}
            color="violet"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Tổng giao dịch"
            value={formatMoney(stats?.payments?.totalAmount || 0)}
            subLabel={`${stats?.payments?.paid || 0} đã thanh toán`}
            color="emerald"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Users Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Users className="h-5 w-5 text-accent-400" />
              Phân bổ Users
            </h3>
            <div className="space-y-4">
              <ProgressBar
                label="Cộng tác viên"
                value={stats?.users?.contributors || 0}
                total={stats?.users?.total || 1}
                color="emerald"
              />
              <ProgressBar
                label="Doanh nghiệp"
                value={stats?.users?.business || 0}
                total={stats?.users?.total || 1}
                color="blue"
              />
              <ProgressBar
                label="Admin"
                value={stats?.users?.admins || 0}
                total={stats?.users?.total || 1}
                color="violet"
              />
            </div>
          </div>

          {/* Tasks Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Briefcase className="h-5 w-5 text-blue-400" />
              Trạng thái Tasks
            </h3>
            <div className="space-y-4">
              <ProgressBar
                label="Đang mở"
                value={stats?.tasks?.open || 0}
                total={stats?.tasks?.total || 1}
                color="emerald"
              />
              <ProgressBar
                label="Đang thực hiện"
                value={stats?.tasks?.inProgress || 0}
                total={stats?.tasks?.total || 1}
                color="blue"
              />
              <ProgressBar
                label="Hoàn thành"
                value={stats?.tasks?.completed || 0}
                total={stats?.tasks?.total || 1}
                color="violet"
              />
              <ProgressBar
                label="Nháp"
                value={stats?.tasks?.draft || 0}
                total={stats?.tasks?.total || 1}
                color="slate"
              />
            </div>
          </div>

          {/* Submissions Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <FileText className="h-5 w-5 text-violet-400" />
              Trạng thái Submissions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <span className="font-medium text-slate-300">Chờ duyệt</span>
                </div>
                <span className="text-lg font-bold text-amber-400">
                  {stats?.submissions?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="font-medium text-slate-300">Đã duyệt</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">
                  {stats?.submissions?.approved || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-rose-500/10 border border-rose-500/20 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  <span className="font-medium text-slate-300">Từ chối</span>
                </div>
                <span className="text-lg font-bold text-rose-400">
                  {stats?.submissions?.rejected || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Payments Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Thanh toán
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
                <span className="font-medium text-slate-300">Tổng giá trị</span>
                <span className="text-lg font-bold text-white">
                  {formatMoney(stats?.payments?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="font-medium text-slate-300">Đã thanh toán</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">
                  {formatMoney(stats?.payments?.paidAmount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <span className="font-medium text-slate-300">Chờ thanh toán</span>
                </div>
                <span className="text-lg font-bold text-amber-400">
                  {formatMoney(stats?.payments?.pendingAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Activity className="h-5 w-5 text-accent-400" />
            Tóm tắt hoạt động
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-slate-400">Tỷ lệ duyệt</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {stats?.submissions?.total
                  ? Math.round(
                      ((stats?.submissions?.approved || 0) /
                        stats?.submissions?.total) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-slate-400">Trung bình reward/task</p>
              <p className="mt-1 text-2xl font-bold text-accent-400">
                {formatMoney(
                  stats?.tasks?.total
                    ? Math.round(
                        (stats?.payments?.totalAmount || 0) / stats?.tasks?.total
                      )
                    : 0
                )}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-slate-400">Users hoạt động</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">
                {stats?.users?.active || stats?.users?.total || 0}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-slate-400">Tỷ lệ hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-violet-400">
                {stats?.tasks?.total
                  ? Math.round(
                      ((stats?.tasks?.completed || 0) / stats?.tasks?.total) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  subLabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel: string;
  color: 'accent' | 'blue' | 'emerald' | 'violet';
}) {
  const colors = {
    accent: 'bg-accent-500/20 text-accent-400',
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    violet: 'bg-violet-500/20 text-violet-400',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{subLabel}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: 'emerald' | 'blue' | 'violet' | 'slate';
}) {
  const percentage = Math.round((value / total) * 100);

  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    slate: 'bg-slate-500',
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-medium text-white">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${colors[color]} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
