/**
 * Public Profile Page - Premium UI/UX Design
 * 
 * Features:
 * - Dark mode with deep navy + teal accent palette
 * - Glassmorphism effects
 * - Smooth micro-animations with Framer Motion
 * - Loading skeletons
 * - Responsive mobile-first design
 * - WCAG AA accessibility
 */

import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import {
  User,
  CheckCircle,
  Calendar,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Award,
  Briefcase,
  Target,
  Users,
  DollarSign,
  Clock,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
} as const;

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
      className="tabular-nums"
    >
      {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value)}
      {suffix}
    </motion.span>
  );
}

// Stat card component with glassmorphism
function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  color = 'teal',
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color?: 'teal' | 'amber' | 'violet' | 'rose' | 'emerald';
  delay?: number;
}) {
  const colorClasses = {
    teal: 'from-teal-500/20 to-teal-600/10 text-teal-400 border-teal-500/20',
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20',
    violet: 'from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/20',
    rose: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20',
  };

  const iconBgClasses = {
    teal: 'bg-teal-500/20 text-teal-400',
    amber: 'bg-amber-500/20 text-amber-400',
    violet: 'bg-violet-500/20 text-violet-400',
    rose: 'bg-rose-500/20 text-rose-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <motion.div
      variants={scaleVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden rounded-2xl border backdrop-blur-xl
        bg-gradient-to-br ${colorClasses[color]}
        p-5 transition-all duration-300
        hover:shadow-lg hover:shadow-${color}-500/10
      `}
    >
      {/* Subtle glow effect */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${color}-500/10 blur-2xl transition-all group-hover:bg-${color}-500/20`} />
      
      <div className="relative flex items-center gap-4">
        <div className={`rounded-xl p-3 ${iconBgClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-white">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Nav skeleton */}
      <div className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Back button skeleton */}
        <div className="mb-8 h-5 w-24 animate-pulse rounded bg-white/5" />

        {/* Profile card skeleton */}
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0f172a]/50 backdrop-blur-xl">
          {/* Cover skeleton */}
          <div className="h-40 animate-pulse bg-gradient-to-r from-white/5 to-white/10 sm:h-52" />

          <div className="relative px-6 pb-8 sm:px-8">
            {/* Avatar skeleton */}
            <div className="absolute -top-16 left-6 sm:-top-20 sm:left-8">
              <div className="h-32 w-32 animate-pulse rounded-2xl border-4 border-[#0f172a] bg-white/10 sm:h-40 sm:w-40" />
            </div>

            <div className="pt-20 sm:pt-24">
              {/* Name skeleton */}
              <div className="mb-4 space-y-2">
                <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
                <div className="h-5 w-32 animate-pulse rounded bg-white/5" />
              </div>

              {/* Stats skeleton */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state / Not found component
function NotFoundState() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="lg" />
          <Link
            href="/tasks"
            className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
          >
            Khám phá Tasks
          </Link>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500/10 to-violet-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative mb-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <User className="h-20 w-20 text-slate-600" />
        </motion.div>

        <h1 className="mb-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Không tìm thấy người dùng
        </h1>
        <p className="mb-8 max-w-md text-center text-slate-400">
          Người dùng này không tồn tại hoặc hồ sơ đã được đặt ở chế độ riêng tư.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur-xl transition-all hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Về trang chủ
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
          >
            <Sparkles className="h-4 w-4" />
            Khám phá Tasks
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Main component
export default function PublicProfilePage() {
  const router = useRouter();
  const { slug } = router.query;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['public-profile', slug],
    queryFn: () => api.get(`/users/${slug}`).then((res) => res.data.data),
    enabled: !!slug,
  });

  // Loading state with skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Error / Not found state
  if (error || !user) {
    return <NotFoundState />;
  }

  // Role configuration with colors and labels
  const roleConfig = {
    CONTRIBUTOR: {
      label: 'Cộng tác viên',
      icon: Zap,
      gradient: 'from-teal-500 to-emerald-500',
      bgGradient: 'from-teal-500/20 to-emerald-500/20',
      textColor: 'text-teal-400',
    },
    BUSINESS: {
      label: 'Doanh nghiệp',
      icon: Briefcase,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/20 to-purple-500/20',
      textColor: 'text-violet-400',
    },
    ADMIN: {
      label: 'Quản trị viên',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      textColor: 'text-amber-400',
    },
  };

  const role = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.CONTRIBUTOR;
  const RoleIcon = role.icon;

  return (
    <>
      <Head>
        <title>{user.name} (@{user.username || 'user'}) - VEarn</title>
        <meta name="description" content={user.bio || `Xem hồ sơ của ${user.name} trên VEarn`} />
      </Head>

      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-teal-500/20 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" />
        </div>

        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Logo size="lg" />
            <Link
              href="/tasks"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Xem Tasks
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </motion.nav>

        {/* Main content */}
        <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              href="/tasks"
              className="group mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Quay lại danh sách
            </Link>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-3xl border border-white/5 bg-[#0f172a]/50 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            {/* Cover Image */}
            <div className="relative h-40 overflow-hidden sm:h-52">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-violet-600 to-purple-700" />
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
              
              {/* Animated particles */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute right-10 top-10 h-20 w-20 rounded-full bg-white/10 blur-xl"
              />
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute bottom-10 left-20 h-32 w-32 rounded-full bg-white/10 blur-xl"
              />
            </div>

            {/* Profile Info Section */}
            <div className="relative px-6 pb-8 sm:px-8">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                className="absolute -top-16 left-6 sm:-top-20 sm:left-8"
              >
                <div className="relative">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={160}
                      height={160}
                      className="h-32 w-32 rounded-2xl border-4 border-[#0f172a] object-cover shadow-2xl sm:h-40 sm:w-40"
                    />
                  ) : (
                    <div className={`flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-[#0f172a] bg-gradient-to-br ${role.gradient} text-3xl font-bold text-white shadow-2xl sm:h-40 sm:w-40 sm:text-4xl`}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  
                  {/* Verified badge */}
                  {user.isVerified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
                      className="absolute -bottom-2 -right-2 rounded-full bg-[#0f172a] p-1"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* User Info */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="pt-20 sm:pt-24"
              >
                {/* Name and role */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      {user.name}
                      {user.isVerified && (
                        <span className="flex items-center gap-1 rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-400">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </h1>
                    
                    {user.username && (
                      <p className="mt-1 text-lg text-slate-400">@{user.username}</p>
                    )}
                    
                    {/* Role badge */}
                    <motion.div
                      variants={itemVariants}
                      className={`mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${role.bgGradient} border border-white/10 px-4 py-1.5`}
                    >
                      <RoleIcon className={`h-4 w-4 ${role.textColor}`} />
                      <span className={`text-sm font-medium ${role.textColor}`}>
                        {role.label}
                      </span>
                    </motion.div>
                  </div>

                  {/* Action buttons (if needed) */}
                  <motion.div variants={itemVariants} className="flex gap-3">
                    <button
                      className="group rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-white/10"
                      aria-label="Share profile"
                    >
                      <ExternalLink className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>
                  </motion.div>
                </motion.div>

                {/* Bio */}
                {user.bio && (
                  <motion.p
                    variants={itemVariants}
                    className="mt-6 max-w-2xl text-slate-300 leading-relaxed"
                  >
                    {user.bio}
                  </motion.p>
                )}

                {/* Stats Grid */}
                <motion.div
                  variants={containerVariants}
                  className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {user.role === 'CONTRIBUTOR' && (
                    <>
                      <StatCard
                        icon={Target}
                        label="Submissions"
                        value={user._count?.submissions || 0}
                        color="teal"
                      />
                      <StatCard
                        icon={Award}
                        label="Đã duyệt"
                        value={user.stats?.approvedCount || 0}
                        color="emerald"
                      />
                      <StatCard
                        icon={TrendingUp}
                        label="Tỷ lệ thành công"
                        value={user.stats?.successRate || 0}
                        suffix="%"
                        color="amber"
                      />
                      <StatCard
                        icon={Briefcase}
                        label="Tasks đã nhận"
                        value={user._count?.assignedTasks || 0}
                        color="violet"
                      />
                    </>
                  )}

                  {user.role === 'BUSINESS' && (
                    <>
                      <StatCard
                        icon={Briefcase}
                        label="Tasks đã tạo"
                        value={user._count?.createdTasks || 0}
                        color="violet"
                      />
                      <StatCard
                        icon={Award}
                        label="Đã hoàn thành"
                        value={user.stats?.completedTasks || 0}
                        color="emerald"
                      />
                      <StatCard
                        icon={DollarSign}
                        label="Tổng thưởng"
                        value={user.stats?.totalReward || 0}
                        suffix="đ"
                        color="amber"
                      />
                      <StatCard
                        icon={Users}
                        label="Đã thuê"
                        value={user.stats?.totalHires || 0}
                        color="teal"
                      />
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <>
                      <StatCard
                        icon={Users}
                        label="Users quản lý"
                        value={user.stats?.totalUsers || 0}
                        color="violet"
                      />
                      <StatCard
                        icon={Briefcase}
                        label="Tasks trong hệ thống"
                        value={user.stats?.totalTasks || 0}
                        color="teal"
                      />
                      <StatCard
                        icon={Target}
                        label="Submissions"
                        value={user.stats?.totalSubmissions || 0}
                        color="emerald"
                      />
                      <StatCard
                        icon={Shield}
                        label="Ngày hoạt động"
                        value={Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        color="amber"
                      />
                    </>
                  )}
                </motion.div>

                {/* Member since */}
                <motion.div
                  variants={itemVariants}
                  className="mt-8 flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="rounded-lg bg-slate-700/50 p-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Thành viên từ</p>
                    <p className="font-medium text-white">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Additional sections can be added here */}
          {/* e.g., Recent Activity, Portfolio, Reviews, etc. */}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-slate-500">
              Bạn muốn làm việc với {user.name}?{' '}
              <Link
                href="/tasks"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                Khám phá các tasks ngay
              </Link>
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative mt-16 border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Logo size="md" />
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} VEarn. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
