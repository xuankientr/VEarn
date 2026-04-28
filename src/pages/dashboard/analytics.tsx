import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Star,
  Send,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    totalSpent: number;
    pendingPayments: number;
    totalApplications: number;
    pendingApplications: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    avgRating: number | null;
    reviewsCount: number;
  };
  charts: {
    tasksByDay: Record<string, number>;
    paymentsByDay: Record<string, number>;
  };
  topContributors: Array<{
    id: string;
    name: string;
    avatar?: string;
    completedTasks: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState('30');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () =>
      api.get(`/analytics/business?period=${period}`).then((res) => res.data.data as AnalyticsData),
    enabled: !!session?.user && session.user.role === 'BUSINESS',
  });

  if (session?.user?.role === 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">Chỉ dành cho Business</h2>
          <p className="text-center text-slate-400 max-w-md">
            Analytics theo từng doanh nghiệp không mở cho admin. Dùng Thống kê hệ thống để xem tổng
            quan.
          </p>
          <Link
            href="/dashboard/admin/stats"
            className="mt-4 text-accent-400 hover:text-accent-300"
          >
            → Thống kê hệ thống
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role === 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">Chỉ dành cho Business</h2>
          <p className="text-slate-400">Trang này chỉ hiển thị cho tài khoản Business</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  return (
    <DashboardLayout>
      <Head>
        <title>Analytics - VEarn</title>
      </Head>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            <BarChart3 className="h-5 w-5 text-accent-400" />
            Analytics
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Thống kê hiệu suất tasks và chi tiêu
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input-premium w-auto"
        >
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
          <option value="365">1 năm</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
              <div className="h-4 w-20 bg-white/10 rounded mb-3" />
              <div className="h-8 w-24 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FileText className="h-5 w-5 text-accent-400" />}
              label="Tổng Tasks"
              value={data.overview.totalTasks}
              subValue={`${data.overview.openTasks} đang mở`}
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
              label="Hoàn thành"
              value={data.overview.completedTasks}
              subValue={`${data.overview.inProgressTasks} đang làm`}
            />
            <StatCard
              icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
              label="Đã chi"
              value={`${formatNumber(data.overview.totalSpent)}đ`}
              subValue={`${formatNumber(data.overview.pendingPayments)}đ chờ TT`}
            />
            <StatCard
              icon={<Star className="h-5 w-5 text-amber-400" />}
              label="Đánh giá"
              value={data.overview.avgRating ? `${data.overview.avgRating}/5` : 'N/A'}
              subValue={`${data.overview.reviewsCount} đánh giá`}
            />
            <StatCard
              icon={<Send className="h-5 w-5 text-violet-400" />}
              label="Ứng tuyển"
              value={data.overview.totalApplications}
              subValue={`${data.overview.pendingApplications} chờ duyệt`}
            />
            <StatCard
              icon={<FileText className="h-5 w-5 text-blue-400" />}
              label="Submissions"
              value={data.overview.totalSubmissions}
              subValue={`${data.overview.pendingSubmissions} chờ duyệt`}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-accent-400" />}
              label="Tỷ lệ hoàn thành"
              value={
                data.overview.totalTasks > 0
                  ? `${Math.round((data.overview.completedTasks / data.overview.totalTasks) * 100)}%`
                  : '0%'
              }
              subValue="Tasks đã hoàn thành"
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-amber-400" />}
              label="TB chi/task"
              value={
                data.overview.completedTasks > 0
                  ? `${formatNumber(Math.round(data.overview.totalSpent / data.overview.completedTasks))}đ`
                  : 'N/A'
              }
              subValue="Mỗi task hoàn thành"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Contributors */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-[15px] font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-accent-400" />
                Top Contributors
              </h3>
              {data.topContributors.length === 0 ? (
                <p className="text-[13px] text-slate-500 text-center py-4">
                  Chưa có contributor nào hoàn thành task
                </p>
              ) : (
                <div className="space-y-3">
                  {data.topContributors.map((contributor, index) => (
                    <div
                      key={contributor.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]"
                    >
                      <span className="text-[13px] font-medium text-slate-500 w-6">
                        #{index + 1}
                      </span>
                      {contributor.avatar ? (
                        <Image
                          src={contributor.avatar}
                          alt={contributor.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-accent-500/20 flex items-center justify-center text-[13px] font-medium text-accent-400">
                          {contributor.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">
                          {contributor.name}
                        </p>
                      </div>
                      <span className="text-[13px] font-medium text-accent-400">
                        {contributor.completedTasks} tasks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-[15px] font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-400" />
                Phân bổ theo danh mục
              </h3>
              {data.categoryStats.length === 0 ? (
                <p className="text-[13px] text-slate-500 text-center py-4">
                  Chưa có dữ liệu
                </p>
              ) : (
                <div className="space-y-3">
                  {data.categoryStats.map((cat) => {
                    const percentage =
                      data.overview.totalTasks > 0
                        ? (cat.count / data.overview.totalTasks) * 100
                        : 0;
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] text-slate-300">{cat.category}</span>
                          <span className="text-[12px] text-slate-500">
                            {cat.count} tasks ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent-500 to-violet-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[12px] text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      {subValue && <p className="text-[12px] text-slate-500 mt-1">{subValue}</p>}
    </div>
  );
}
