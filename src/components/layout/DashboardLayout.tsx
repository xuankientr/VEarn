'use client';

/**
 * Dashboard Layout - Linear/Vercel Inspired
 * Senior Design System v2.0
 */

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  Wallet,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Plus,
  ClipboardList,
  Settings,
  Send,
  ChevronDown,
  Bookmark,
  Activity,
  Landmark,
  Banknote,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { GlobalSearch } from '@/components/GlobalSearch';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  readonly name: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly show: boolean;
}

interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavItem[];
}

/**
 * Active khi đúng path hoặc route con (trừ /dashboard để không bôi cả cây).
 */
const pathMatches = (href: string, pathname: string): boolean => {
  if (pathname === href) return true;
  if (href === '/dashboard') return false;
  return pathname.startsWith(`${href}/`);
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/user/profile').then((res) => res.data.data),
    enabled: status === 'authenticated' && !!session,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  const role = session?.user?.role;
  const isAdmin = role === 'ADMIN';
  const isBusiness = role === 'BUSINESS';
  const isContributor = role === 'CONTRIBUTOR';
  const showCreateTask = isBusiness || isAdmin;

  const primaryLinks: readonly NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Khám phá', href: '/tasks', icon: ListTodo, show: true },
  ].filter((i) => i.show);

  const navGroups: readonly NavGroup[] = useMemo(() => {
    const workItems: readonly NavItem[] = [
      { name: 'Đã lưu', href: '/dashboard/saved-tasks', icon: Bookmark, show: true },
      { name: 'Nhật ký hoạt động', href: '/dashboard/activity', icon: Activity, show: true },
      { name: 'Tasks của tôi', href: '/dashboard/my-tasks', icon: ClipboardList, show: isContributor },
      { name: 'Ứng tuyển', href: '/dashboard/applications', icon: Send, show: isContributor },
      {
        name: 'Submissions',
        href: '/dashboard/submissions',
        icon: FileText,
        show: isContributor || isBusiness,
      },
      { name: 'Quản lý Tasks', href: '/dashboard/tasks', icon: FileText, show: isBusiness || isAdmin },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, show: isBusiness },
    ].filter((i) => i.show);

    const financeItems: readonly NavItem[] = [
      { name: 'Thu nhập', href: '/dashboard/earnings', icon: Wallet, show: isContributor },
      { name: 'TK nhận tiền', href: '/dashboard/payout-bank', icon: Banknote, show: isContributor },
      { name: 'Ví thu nhập', href: '/dashboard/wallet', icon: Landmark, show: isContributor },
      { name: 'Ví & nạp tiền', href: '/dashboard/wallet', icon: Landmark, show: isBusiness },
      /* Tên khác nhóm "Thanh toán" để tránh trùng nhãn */
      { name: 'Lịch sử chi trả', href: '/dashboard/payments', icon: Wallet, show: isBusiness },
    ].filter((i) => i.show);

    const adminItems: readonly NavItem[] = [
      { name: 'Users', href: '/dashboard/admin/users', icon: Users, show: isAdmin },
      { name: 'Thống kê', href: '/dashboard/admin/stats', icon: BarChart3, show: isAdmin },
      {
        name: 'Xác nhận nạp ví',
        href: '/dashboard/admin/wallet-topups',
        icon: Banknote,
        show: isAdmin,
      },
    ].filter((i) => i.show);

    const groups: NavGroup[] = [];
    if (workItems.length > 0) {
      groups.push({ id: 'work', label: 'Hoạt động', items: workItems });
    }
    if (financeItems.length > 0) {
      groups.push({ id: 'finance', label: 'Thanh toán', items: financeItems });
    }
    if (adminItems.length > 0) {
      groups.push({ id: 'admin', label: 'Quản trị', items: adminItems });
    }
    return groups;
  }, [isAdmin, isBusiness, isContributor]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of navGroups) {
        if (g.items.some((i) => pathMatches(i.href, router.pathname))) {
          next[g.id] = true;
        }
      }
      return next;
    });
  }, [router.pathname, navGroups]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return null;

  const roleConfig = {
    ADMIN: { label: 'Quản trị viên', class: 'text-violet-400' },
    BUSINESS: { label: 'Doanh nghiệp', class: 'text-accent-400' },
    CONTRIBUTOR: { label: 'Cộng tác viên', class: 'text-emerald-400' },
  };

  const userRole = roleConfig[session.user.role as keyof typeof roleConfig];
  const userName = profile?.name || session.user.name || 'User';

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-60">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-accent-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-violet-500/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                    border-r border-white/[0.06] bg-[#0a0f1a]/95 backdrop-blur-xl
                    transform transition-transform duration-300 ease-out-expo
                    lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/[0.06]">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-icon lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-premium px-3 py-4">
          <ul className="space-y-0.5">
            {primaryLinks.map((item) => {
              const isActive = pathMatches(item.href, router.pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] font-medium
                               transition-all duration-150
                               ${isActive
                                 ? 'bg-white/[0.08] text-white'
                                 : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'}`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-accent-400' : 'text-slate-500'}`} />
                    {item.name}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    )}
                  </Link>
                </li>
              );
            })}

            {showCreateTask && (
              <li className="pt-3 pb-1">
                <Link
                  href="/dashboard/tasks/create"
                  className="btn-primary flex h-9 w-full items-center justify-start gap-2.5 px-3 text-[13px]"
                >
                  <Plus className="h-4 w-4" />
                  Tạo Task
                </Link>
              </li>
            )}

            {navGroups.map((group) => (
              <SidebarNavGroup
                key={group.id}
                group={group}
                pathname={router.pathname}
                isOpen={openGroups[group.id] ?? false}
                onToggle={() =>
                  setOpenGroups((p) => ({
                    ...p,
                    [group.id]: !(p[group.id] ?? false),
                  }))
                }
              />
            ))}

            <li className="pt-2">
              <Link
                href="/dashboard/settings"
                className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-all duration-150
                  ${pathMatches('/dashboard/settings', router.pathname)
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
              >
                <Settings
                  className={`h-4 w-4 ${pathMatches('/dashboard/settings', router.pathname) ? 'text-accent-400' : 'text-slate-500'}`}
                />
                Cài đặt
                {pathMatches('/dashboard/settings', router.pathname) && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                )}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2.5 w-full h-9 px-3 rounded-lg
                       text-[13px] font-medium text-slate-400
                       hover:text-rose-400 hover:bg-rose-500/[0.08] transition-colors duration-150"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 lg:px-6
                          border-b border-white/[0.06] bg-[#0a0f1a]/80 backdrop-blur-xl">
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Global Search */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Quick action */}
            <Link href="/tasks" className="btn-secondary h-9 px-3 hidden sm:flex">
              <ListTodo className="h-4 w-4" />
              <span className="text-[13px]">Tasks</span>
            </Link>

            {/* Hồ sơ — trên navbar (desktop + mobile) */}
            <Link
              href="/dashboard/profile"
              className={`group flex max-w-[min(100%,14rem)] items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors
                ${router.pathname === '/dashboard/profile'
                  ? 'border-white/[0.1] bg-white/[0.06]'
                  : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]'}`}
            >
              {profile?.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="avatar avatar-sm shrink-0 rounded-lg">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              <div className="hidden min-w-0 flex-1 text-left sm:block">
                <p className="truncate text-[13px] font-medium text-white">{userName}</p>
                <p className={`truncate text-[11px] ${userRole.class}`}>{userRole.label}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-slate-400 sm:block" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarNavGroupProps {
  readonly group: NavGroup;
  readonly pathname: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function SidebarNavGroup({ group, pathname, isOpen, onToggle }: SidebarNavGroupProps) {
  const hasActiveChild = group.items.some((i) => pathMatches(i.href, pathname));

  return (
    <li className="mt-3 list-none first:mt-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:bg-white/[0.03] hover:text-slate-400"
      >
        {group.label}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-0.5 border-l border-white/[0.06] pl-2 ml-3">
          {group.items.map((item) => {
            const isActive = pathMatches(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-9 items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-accent-400' : 'text-slate-500'}`} />
                  <span className="min-w-0 truncate">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {!isOpen && hasActiveChild && (
        <p className="mt-1 px-3 text-[11px] text-accent-400/90 truncate" title={group.items.find((i) => pathMatches(i.href, pathname))?.name}>
          {group.items.find((i) => pathMatches(i.href, pathname))?.name}
        </p>
      )}
    </li>
  );
}
