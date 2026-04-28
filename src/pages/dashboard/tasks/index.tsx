/**
 * Manage Tasks Page - Premium Dark Theme
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  MoreVertical,
  AlertCircle,
  Loader2,
  FileText,
  MessageSquare,
  Briefcase,
  ClipboardList,
  ImageIcon,
} from 'lucide-react';

export default function ManageTasksPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-tasks', statusFilter],
    queryFn: () =>
      api
        .get('/tasks/my-tasks', { params: { status: statusFilter || undefined } })
        .then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      toast.success('Đã xóa task');
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const handleDelete = (taskId: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa task "${title}"?`)) {
      deleteMutation.mutate(taskId);
    }
    setOpenMenu(null);
  };

  const filteredTasks = data?.data?.filter((task: any) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (session?.user?.role === 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="mb-4 text-slate-400">
            Chỉ tài khoản Business mới có thể quản lý tasks
          </p>
          <Link href="/dashboard" className="text-accent-400 hover:text-accent-300">
            ← Quay lại Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      DRAFT: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      OPEN: 'badge-emerald',
      IN_PROGRESS: 'badge-accent',
      SUBMITTED: 'badge-amber',
      APPROVED: 'badge-violet',
      CLOSED: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    };
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      OPEN: 'Đang mở',
      IN_PROGRESS: 'Đang làm',
      SUBMITTED: 'Đã nộp',
      APPROVED: 'Hoàn thành',
      CLOSED: 'Đã đóng',
    };
    return { class: badges[status] || badges.DRAFT, label: labels[status] || status };
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Quản lý Tasks - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Quản lý Tasks</h1>
            <p className="mt-1 text-slate-400">
              {session?.user?.role === 'ADMIN'
                ? 'Xem toàn bộ task trên hệ thống (thông tin cơ bản). Không mở đơn ứng tuyển hay submissions. Chỉ sửa/xóa task do chính bạn tạo.'
                : 'Xem và quản lý các tasks bạn đã tạo'}
            </p>
          </div>
          <Link href="/dashboard/tasks/create" className="btn-primary">
            <Plus className="h-5 w-5" />
            <span>Tạo Task mới</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl transition hover:bg-white/10 focus:border-accent-500/50 focus:outline-none"
          >
            <option value="" className="bg-navy-950">Tất cả trạng thái</option>
            <option value="DRAFT" className="bg-navy-950">Nháp</option>
            <option value="OPEN" className="bg-navy-950">Đang mở</option>
            <option value="IN_PROGRESS" className="bg-navy-950">Đang làm</option>
            <option value="SUBMITTED" className="bg-navy-950">Đã nộp</option>
            <option value="APPROVED" className="bg-navy-950">Hoàn thành</option>
            <option value="CLOSED" className="bg-navy-950">Đã đóng</option>
          </select>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
          </div>
        ) : filteredTasks?.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16">
            <div className="mb-6 h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center">
              <Briefcase className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              {searchQuery ? 'Không tìm thấy task' : 'Chưa có task nào'}
            </h3>
            <p className="mb-6 text-slate-400">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu tạo task đầu tiên của bạn'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/tasks/create" className="btn-primary">
                <Plus className="h-5 w-5" />
                <span>Tạo Task mới</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Task</th>
                    {isAdmin && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                        Người tạo
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Thưởng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Người nhận</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Submissions</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTasks?.map((task: any) => {
                    const badge = getStatusBadge(task.status);
                    const canManageTask = session?.user?.id === task.creatorId;
                    return (
                      <tr key={task.id} className="transition hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex max-w-md items-start gap-3">
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                              {task.coverImageUrl ? (
                                <Image
                                  src={task.coverImageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                  unoptimized={
                                    typeof task.coverImageUrl === 'string' &&
                                    task.coverImageUrl.startsWith('http://')
                                  }
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/tasks/${task.slug}`}
                                className="font-medium text-white transition hover:text-accent-400"
                              >
                                {task.title}
                              </Link>
                              {task.category && (
                                <p className="mt-1 text-sm text-slate-500">{task.category}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-white">{task.creator?.name}</p>
                              <p className="text-slate-500">{task.creator?.email}</p>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className={badge.class}>{badge.label}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-emerald-400">
                            {new Intl.NumberFormat('vi-VN').format(task.reward)} đ
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <Users className="h-4 w-4" />
                            {task._count?.assignees || 0}/{task.maxAssignees}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <FileText className="h-4 w-4" />
                            {task._count?.submissions || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {openMenu === task.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-48 glass-card py-1 shadow-xl">
                                  <Link
                                    href={`/tasks/${task.slug}`}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    Xem chi tiết
                                  </Link>
                                  {!isAdmin && (
                                    <Link
                                      href={`/dashboard/tasks/${task.id}/applications`}
                                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                                      onClick={() => setOpenMenu(null)}
                                    >
                                      <ClipboardList className="h-4 w-4" />
                                      Xem đơn ứng tuyển
                                    </Link>
                                  )}
                                  {!isAdmin && (
                                    <Link
                                      href={`/dashboard/tasks/${task.id}/submissions`}
                                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                                      onClick={() => setOpenMenu(null)}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      Xem submissions ({task._count?.submissions || 0})
                                    </Link>
                                  )}
                                  {canManageTask && (
                                    <Link
                                      href={`/dashboard/tasks/${task.id}/edit`}
                                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                                      onClick={() => setOpenMenu(null)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      Chỉnh sửa
                                    </Link>
                                  )}
                                  {canManageTask && (
                                  <button
                                    onClick={() => handleDelete(task.id, task.title)}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa task
                                  </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {data?.data && data.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card p-5">
              <p className="text-sm text-slate-400">Tổng tasks</p>
              <p className="mt-1 text-2xl font-bold text-white">{data.data.length}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-slate-400">Đang mở</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {data.data.filter((t: any) => t.status === 'OPEN').length}
              </p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-slate-400">Đang thực hiện</p>
              <p className="mt-1 text-2xl font-bold text-accent-400">
                {data.data.filter((t: any) => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-slate-400">Hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-violet-400">
                {data.data.filter((t: any) => t.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
