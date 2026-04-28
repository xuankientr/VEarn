import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SaveTaskButton } from '@/components/SaveTaskButton';
import {
  Bookmark,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  slug: string;
  description: string;
  reward: number;
  deadline?: string;
  status: string;
  category?: string;
  skills: string[];
  maxAssignees: number;
  savedAt: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count: {
    assignees: number;
    submissions: number;
  };
}

export default function SavedTasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['savedTasks'],
    queryFn: () => api.get('/saved-tasks').then((res) => res.data.data),
  });

  const tasks: Task[] = data || [];

  const statusColors: Record<string, string> = {
    OPEN: 'badge-emerald',
    IN_PROGRESS: 'badge-accent',
    SUBMITTED: 'badge-amber',
    APPROVED: 'badge-violet',
    CLOSED: 'badge-slate',
  };

  const statusLabels: Record<string, string> = {
    OPEN: 'Đang mở',
    IN_PROGRESS: 'Đang làm',
    SUBMITTED: 'Đã nộp',
    APPROVED: 'Hoàn thành',
    CLOSED: 'Đã đóng',
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Tasks đã lưu - VEarn</title>
      </Head>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          <Bookmark className="h-5 w-5 text-accent-400" />
          Tasks đã lưu
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          {tasks.length} task đã lưu
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
              <div className="h-5 w-3/4 bg-white/10 rounded mb-3" />
              <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Bookmark className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-[15px] font-medium text-white mb-2">
            Chưa có task nào được lưu
          </h3>
          <p className="text-[13px] text-slate-400 mb-6">
            Lưu các task bạn quan tâm để xem lại sau
          </p>
          <Link href="/tasks" className="btn-primary">
            Khám phá Tasks
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="glass-card rounded-xl p-5 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${statusColors[task.status] || 'badge-slate'} text-[10px]`}>
                      {statusLabels[task.status] || task.status}
                    </span>
                    {task.category && (
                      <span className="text-[10px] text-slate-500">
                        {task.category}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/tasks/${task.slug}`}
                    className="text-[15px] font-medium text-white hover:text-accent-400 
                              transition-colors line-clamp-1"
                  >
                    {task.title}
                  </Link>
                </div>
                <SaveTaskButton taskId={task.id} size="sm" />
              </div>

              <p className="text-[13px] text-slate-400 line-clamp-2 mb-4">
                {task.description}
              </p>

              <div className="flex items-center gap-4 text-[12px] text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-400 font-medium">
                    {new Intl.NumberFormat('vi-VN').format(task.reward)}đ
                  </span>
                </div>
                {task.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(task.deadline).toLocaleDateString('vi-VN')}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {task._count.assignees}/{task.maxAssignees}
                </div>
              </div>

              {task.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {task.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-white/[0.05] text-[11px] text-slate-400"
                    >
                      {skill}
                    </span>
                  ))}
                  {task.skills.length > 3 && (
                    <span className="text-[11px] text-slate-500">
                      +{task.skills.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-slate-500">
                  Lưu {new Date(task.savedAt).toLocaleDateString('vi-VN')}
                </p>
                <Link
                  href={`/tasks/${task.slug}`}
                  className="text-[12px] text-accent-400 hover:text-accent-300 
                            flex items-center gap-1"
                >
                  Xem chi tiết
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
