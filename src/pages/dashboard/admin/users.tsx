import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Search,
  Users,
  Shield,
  Ban,
  CheckCircle,
  MoreVertical,
  Loader2,
  AlertCircle,
  Briefcase,
  FileText,
  Download,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () =>
      api
        .get('/admin/users', { params: { role: roleFilter || undefined } })
        .then((res) => res.data),
    enabled: session?.user?.role === 'ADMIN',
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.put(`/admin/users/${userId}`, { isActive }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái user');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.put(`/admin/users/${userId}`, { role }),
    onSuccess: () => {
      toast.success('Đã cập nhật role');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const bulkToggleStatusMutation = useMutation({
    mutationFn: async ({ userIds, isActive }: { userIds: string[]; isActive: boolean }) => {
      await Promise.all(userIds.map((id) => api.put(`/admin/users/${id}`, { isActive })));
    },
    onSuccess: () => {
      toast.success('Đã cập nhật hàng loạt');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers(new Set());
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật');
    },
  });

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u: any) => u.id)));
    }
  };

  const exportUsers = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Status', 'Created'].join(','),
      ...filteredUsers.map((u: any) =>
        [u.id, u.name, u.email, u.role, u.isActive ? 'Active' : 'Inactive', u.createdAt].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Đã xuất file CSV');
  };

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

  const users = data?.data || [];
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u: any) => u.role === 'ADMIN').length,
    business: users.filter((u: any) => u.role === 'BUSINESS').length,
    contributors: users.filter((u: any) => u.role === 'CONTRIBUTOR').length,
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; class: string; icon: any }> = {
      ADMIN: {
        label: 'Admin',
        class: 'badge-violet',
        icon: Shield,
      },
      BUSINESS: {
        label: 'Doanh nghiệp',
        class: 'badge-accent',
        icon: Briefcase,
      },
      CONTRIBUTOR: {
        label: 'Cộng tác viên',
        class: 'badge-emerald',
        icon: Users,
      },
    };
    return badges[role] || badges.CONTRIBUTOR;
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Quản lý Users - VEarn Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Quản lý Users</h1>
          <p className="mt-1 text-slate-400">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Tổng users</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/20 p-2">
                <Shield className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">{stats.admins}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-500/20 p-2">
                <Briefcase className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-400">{stats.business}</p>
                <p className="text-xs text-slate-400">Doanh nghiệp</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.contributors}
                </p>
                <p className="text-xs text-slate-400">Cộng tác viên</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium w-full pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-premium"
          >
            <option value="">Tất cả roles</option>
            <option value="ADMIN">Admin</option>
            <option value="BUSINESS">Doanh nghiệp</option>
            <option value="CONTRIBUTOR">Cộng tác viên</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-premium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
          <button onClick={exportUsers} className="btn-secondary h-10 px-4 shrink-0">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <span className="text-[13px] text-white">
              Đã chọn <strong>{selectedUsers.size}</strong> users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  bulkToggleStatusMutation.mutate({
                    userIds: Array.from(selectedUsers),
                    isActive: false,
                  })
                }
                disabled={bulkToggleStatusMutation.isPending}
                className="btn-ghost h-8 px-3 text-[12px] text-rose-400 hover:bg-rose-500/10"
              >
                <Ban className="h-4 w-4" />
                Khóa tất cả
              </button>
              <button
                onClick={() =>
                  bulkToggleStatusMutation.mutate({
                    userIds: Array.from(selectedUsers),
                    isActive: true,
                  })
                }
                disabled={bulkToggleStatusMutation.isPending}
                className="btn-ghost h-8 px-3 text-[12px] text-emerald-400 hover:bg-emerald-500/10"
              >
                <CheckCircle className="h-4 w-4" />
                Mở khóa tất cả
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="btn-ghost h-8 px-3 text-[12px]"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-4 w-12">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                        {selectedUsers.size === 0 ? (
                          <Square className="h-5 w-5" />
                        ) : selectedUsers.size === filteredUsers.length ? (
                          <CheckSquare className="h-5 w-5 text-accent-400" />
                        ) : (
                          <MinusSquare className="h-5 w-5 text-accent-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Hoạt động
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user: any) => {
                    const badge = getRoleBadge(user.role);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-4 py-4 w-12">
                          <button
                            onClick={() => toggleSelectUser(user.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {selectedUsers.has(user.id) ? (
                              <CheckSquare className="h-5 w-5 text-accent-400" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-violet-600 text-sm font-medium text-white">
                                {user.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-white">
                                {user.name}
                              </p>
                              <p className="text-sm text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.class}`}
                          >
                            <BadgeIcon className="h-3.5 w-3.5" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                              <CheckCircle className="h-4 w-4" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-rose-400">
                              <Ban className="h-4 w-4" />
                              Bị khóa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {user._count?.createdTasks || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {user._count?.submissions || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === user.id ? null : user.id)
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {openMenu === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenu(null)}
                                />
                                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-white/10 bg-navy-800 py-1 shadow-lg">
                                  <button
                                    onClick={() => {
                                      toggleStatusMutation.mutate({
                                        userId: user.id,
                                        isActive: !user.isActive,
                                      });
                                      setOpenMenu(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                                  >
                                    {user.isActive ? (
                                      <>
                                        <Ban className="h-4 w-4" />
                                        Khóa tài khoản
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        Mở khóa
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t border-white/10 py-1">
                                    <p className="px-4 py-1 text-xs text-slate-500">
                                      Đổi role
                                    </p>
                                    {['CONTRIBUTOR', 'BUSINESS', 'ADMIN'].map(
                                      (role) => (
                                        <button
                                          key={role}
                                          onClick={() => {
                                            changeRoleMutation.mutate({
                                              userId: user.id,
                                              role,
                                            });
                                            setOpenMenu(null);
                                          }}
                                          disabled={user.role === role}
                                          className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
                                            user.role === role
                                              ? 'text-slate-600'
                                              : 'text-slate-300 hover:bg-white/5'
                                          }`}
                                        >
                                          {getRoleBadge(role).label}
                                          {user.role === role && ' (hiện tại)'}
                                        </button>
                                      )
                                    )}
                                  </div>
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
      </div>
    </DashboardLayout>
  );
}
