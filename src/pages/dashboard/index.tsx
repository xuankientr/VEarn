/**
 * Dashboard - Linear/Vercel Inspired Design
 */

import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  Eye,
  ClipboardList,
  CreditCard,
  Users,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function DashboardPage() {
  const { data: session } = useSession();

  const isContributor = session?.user.role === 'CONTRIBUTOR';
  const isBusiness = session?.user.role === 'BUSINESS';
  const isAdmin = session?.user.role === 'ADMIN';

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/user/me').then((res) => res.data.data),
  });

  const { data: submissions } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => api.get('/submissions?limit=5').then((res) => res.data),
    enabled: isContributor || isBusiness,
  });

  const { data: adminOverview } = useQuery({
    queryKey: ['admin-stats-dashboard'],
    queryFn: () => api.get('/admin/stats').then((res) => res.data.data),
    enabled: !!session?.user && isAdmin,
  });
  const userName = (profile?.name || session?.user.name)?.split(' ')[0] || 'User';

  const roleLabel = isContributor ? 'Contributor' : isBusiness ? 'Business' : 'Admin';

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Xin chào, {userName}
              </h1>
              <p className="text-[13px] text-slate-400 mt-0.5">
                {isContributor && 'Khám phá các tasks mới và bắt đầu kiếm tiền'}
                {isBusiness && 'Quản lý các tasks và theo dõi submissions'}
                {isAdmin && 'Quản lý hệ thống VEarn'}
              </p>
            </div>
            <span className={`badge-${isContributor ? 'emerald' : isBusiness ? 'accent' : 'violet'}`}>
              {roleLabel}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease }}
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {isContributor && (
            <>
              <StatCard
                icon={<Briefcase className="h-4 w-4" />}
                label="Tasks đã nhận"
                value={profile?._count?.assignedTasks || 0}
                color="accent"
              />
              <StatCard
                icon={<FileText className="h-4 w-4" />}
                label="Submissions"
                value={profile?._count?.submissions || 0}
                color="violet"
              />
              <StatCard
                icon={<DollarSign className="h-4 w-4" />}
                label="Tổng thu nhập"
                value={formatMoney(profile?.earningStats?.total || 0)}
                color="emerald"
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Chờ thanh toán"
                value={formatMoney(profile?.earningStats?.pending || 0)}
                color="amber"
              />
            </>
          )}

          {isBusiness && (
            <>
              <StatCard
                icon={<Briefcase className="h-4 w-4" />}
                label="Tasks đã tạo"
                value={profile?._count?.createdTasks || 0}
                color="accent"
              />
              <StatCard
                icon={<FileText className="h-4 w-4" />}
                label="Submissions"
                value={submissions?.pagination?.total || 0}
                color="violet"
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Chờ duyệt"
                value={submissions?.data?.filter((s: any) => s.status === 'PENDING').length || 0}
                color="amber"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Đã hoàn thành"
                value={submissions?.data?.filter((s: any) => s.status === 'APPROVED').length || 0}
                color="emerald"
              />
            </>
          )}

          {isAdmin && (
            <>
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="Người dùng"
                value={adminOverview?.users?.total ?? 0}
                color="accent"
              />
              <StatCard
                icon={<Briefcase className="h-4 w-4" />}
                label="Tasks (toàn hệ thống)"
                value={adminOverview?.tasks?.total ?? 0}
                color="violet"
              />
              <StatCard
                icon={<FileText className="h-4 w-4" />}
                label="Submissions chờ duyệt"
                value={adminOverview?.submissions?.pending ?? 0}
                color="amber"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Doanh nghiệp"
                value={adminOverview?.users?.business ?? 0}
                color="emerald"
              />
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease }}
        >
          <h2 className="text-[13px] font-medium text-slate-500 mb-3">Thao tác nhanh</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {isContributor && (
              <>
                <ActionCard href="/tasks" icon={<Briefcase />} label="Tìm Tasks" primary />
                <ActionCard href="/dashboard/my-tasks" icon={<ClipboardList />} label="Tasks của tôi" />
                <ActionCard href="/dashboard/submissions" icon={<FileText />} label="Submissions" />
                <ActionCard href="/dashboard/earnings" icon={<DollarSign />} label="Thu nhập" />
              </>
            )}
            {isBusiness && (
              <>
                <ActionCard href="/dashboard/tasks/create" icon={<Plus />} label="Tạo Task" primary />
                <ActionCard href="/dashboard/tasks" icon={<ClipboardList />} label="Quản lý Tasks" />
                <ActionCard href="/dashboard/submissions" icon={<Eye />} label="Submissions" />
                <ActionCard href="/dashboard/payments" icon={<CreditCard />} label="Thanh toán" />
              </>
            )}
            {isAdmin && (
              <>
                <ActionCard href="/dashboard/admin/users" icon={<Users />} label="Users" />
                <ActionCard
                  href="/dashboard/admin/stats"
                  icon={<TrendingUp />}
                  label="Thống kê"
                  primary
                />
                <ActionCard
                  href="/dashboard/admin/wallet-topups"
                  icon={<CreditCard />}
                  label="Xác nhận nạp ví"
                />
                <ActionCard href="/dashboard/tasks" icon={<ClipboardList />} label="Tasks của tôi" />
              </>
            )}
          </div>
        </motion.div>

        {/* Recent Submissions (không hiển thị chi tiết cho admin) */}
        {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-slate-500">Submissions gần đây</h2>
            <Link
              href="/dashboard/submissions"
              className="text-[12px] font-medium text-accent-400 hover:text-accent-300 
                        flex items-center gap-1 transition-colors"
            >
              Xem tất cả
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {submissions?.data && submissions.data.length > 0 ? (
            <div className="glass-card divide-y divide-white/[0.04]">
              {submissions.data.slice(0, 5).map((submission: any) => (
                <Link
                  key={submission.id}
                  href={`/dashboard/submissions/${submission.id}`}
                  className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] sm:flex">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white group-hover:text-accent-300">
                        {submission.task.title}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        {new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        <span className="ml-2 text-accent-500/80">· Xem chi tiết</span>
                      </p>
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <StatusBadge status={submission.status} />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-[14px] font-medium text-white mb-1">
                Chưa có submissions
              </p>
              <p className="text-[13px] text-slate-500 mb-4">
                Bắt đầu nhận task để thấy submissions ở đây
              </p>
              {isContributor && (
                <Link href="/tasks" className="btn-primary h-9 px-4 inline-flex">
                  <Sparkles className="h-4 w-4" />
                  Tìm Tasks
                </Link>
              )}
            </div>
          )}
        </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'accent' | 'violet' | 'emerald' | 'amber';
}) {
  const iconColors = {
    accent: 'text-accent-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="glass-card p-4 hover:border-white/[0.1] transition-colors">
      <div className={`mb-2 ${iconColors[color]}`}>{icon}</div>
      <p className="text-xl font-semibold text-white tracking-tight">{value}</p>
      <p className="text-[12px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-150
                 ${primary 
                   ? 'bg-accent-500/10 border border-accent-500/20 hover:bg-accent-500/15' 
                   : 'bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05]'}`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center
                      ${primary ? 'bg-accent-500/20 text-accent-400' : 'bg-white/[0.04] text-slate-400'}`}>
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>
      <span className="text-[13px] font-medium text-white flex-1">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 
                               -translate-x-1 group-hover:translate-x-0 transition-all" />
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
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
    <span className={config[status] || 'badge-slate'}>
      {labels[status] || status}
    </span>
  );
}

function formatMoney(amount: number) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M đ`;
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}K đ`;
  }
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}
