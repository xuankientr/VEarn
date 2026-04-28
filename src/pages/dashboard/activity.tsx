import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Activity,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  Plus,
  Clock,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  link?: string;
  metadata?: any;
  createdAt: string;
}

export default function ActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.get('/user/activity?limit=50').then((res) => res.data.data as ActivityItem[]),
  });

  const activities = data || [];

  const getIcon = (type: string, metadata?: any) => {
    switch (type) {
      case 'submission':
        if (metadata?.status === 'APPROVED') return <CheckCircle className="h-4 w-4 text-emerald-400" />;
        if (metadata?.status === 'REJECTED') return <XCircle className="h-4 w-4 text-rose-400" />;
        return <FileText className="h-4 w-4 text-accent-400" />;
      case 'application':
        if (metadata?.status === 'APPROVED') return <CheckCircle className="h-4 w-4 text-emerald-400" />;
        if (metadata?.status === 'REJECTED') return <XCircle className="h-4 w-4 text-rose-400" />;
        return <Send className="h-4 w-4 text-violet-400" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-emerald-400" />;
      case 'task_created':
        return <Plus className="h-4 w-4 text-accent-400" />;
      case 'review_given':
      case 'review_received':
        return <Star className="h-4 w-4 text-amber-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTypeColor = (type: string, metadata?: any) => {
    switch (type) {
      case 'submission':
        if (metadata?.status === 'APPROVED') return 'bg-emerald-500/10 border-emerald-500/20';
        if (metadata?.status === 'REJECTED') return 'bg-rose-500/10 border-rose-500/20';
        return 'bg-accent-500/10 border-accent-500/20';
      case 'application':
        if (metadata?.status === 'APPROVED') return 'bg-emerald-500/10 border-emerald-500/20';
        if (metadata?.status === 'REJECTED') return 'bg-rose-500/10 border-rose-500/20';
        return 'bg-violet-500/10 border-violet-500/20';
      case 'payment':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'task_created':
        return 'bg-accent-500/10 border-accent-500/20';
      case 'review_given':
      case 'review_received':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Group activities by date
  const groupedActivities: Record<string, ActivityItem[]> = {};
  activities.forEach((activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('vi-VN');
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Nhật ký hoạt động - VEarn</title>
      </Head>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          <Activity className="h-5 w-5 text-accent-400" />
          Nhật ký hoạt động
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Theo dõi các sự kiện và thao tác gần đây của bạn trên VEarn
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/10 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-[15px] font-medium text-white mb-2">
            Chưa có hoạt động nào
          </h3>
          <p className="text-[13px] text-slate-400 mb-6">
            Bắt đầu bằng cách khám phá và ứng tuyển tasks
          </p>
          <Link href="/tasks" className="btn-primary">
            Khám phá Tasks
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-[13px] font-medium text-slate-400">{date}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="space-y-2">
                {items.map((activity) => (
                  <div
                    key={activity.id}
                    className="glass-card rounded-xl p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {activity.link ? (
                      <Link href={activity.link} className="flex items-start gap-3">
                        <ActivityContent
                          activity={activity}
                          getIcon={getIcon}
                          getTypeColor={getTypeColor}
                          formatDate={formatDate}
                        />
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3">
                        <ActivityContent
                          activity={activity}
                          getIcon={getIcon}
                          getTypeColor={getTypeColor}
                          formatDate={formatDate}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function ActivityContent({
  activity,
  getIcon,
  getTypeColor,
  formatDate,
}: {
  activity: ActivityItem;
  getIcon: (type: string, metadata?: any) => React.ReactNode;
  getTypeColor: (type: string, metadata?: any) => string;
  formatDate: (dateStr: string) => string;
}) {
  return (
    <>
      <div
        className={`h-10 w-10 rounded-lg border flex items-center justify-center shrink-0 ${getTypeColor(
          activity.type,
          activity.metadata
        )}`}
      >
        {getIcon(activity.type, activity.metadata)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white">{activity.title}</p>
        <p className="text-[13px] text-slate-400 truncate">{activity.description}</p>
      </div>
      <span className="text-[12px] text-slate-500 shrink-0">
        {formatDate(activity.createdAt)}
      </span>
    </>
  );
}
