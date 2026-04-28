/**
 * Tasks Listing - Linear/Vercel Inspired
 */

import { useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { api } from '@/lib/api';
import {
  Search,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  SlidersHorizontal,
  X,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

type SortOption = 'newest' | 'reward_high' | 'reward_low' | 'deadline';
const ease = [0.16, 1, 0.3, 1] as const;

export default function TasksPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minReward, setMinReward] = useState('');
  const [maxReward, setMaxReward] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', category],
    queryFn: () =>
      api.get('/tasks', {
        params: { status: 'OPEN', category: category || undefined, limit: 50 },
      }).then((res) => res.data),
  });

  const tasks = data?.data || [];

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter((task: any) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());
      const matchesMinReward = !minReward || task.reward >= parseInt(minReward);
      const matchesMaxReward = !maxReward || task.reward <= parseInt(maxReward);
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) => task.skills?.includes(skill));
      return matchesSearch && matchesMinReward && matchesMaxReward && matchesSkills;
    });

    switch (sortBy) {
      case 'reward_high':
        result.sort((a: any, b: any) => b.reward - a.reward);
        break;
      case 'reward_low':
        result.sort((a: any, b: any) => a.reward - b.reward);
        break;
      case 'deadline':
        result.sort((a: any, b: any) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      default:
        result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [tasks, search, minReward, maxReward, selectedSkills, sortBy]);

  const categories = [
    { name: 'Tất cả', value: '' },
    { name: 'Content', value: 'Content Writing' },
    { name: 'Design', value: 'Graphic Design' },
    { name: 'Translation', value: 'Translation' },
    { name: 'Data Entry', value: 'Data Entry' },
    { name: 'Social Media', value: 'Social Media' },
    { name: 'Development', value: 'Web Development' },
    { name: 'Video', value: 'Video Editing' },
    { name: 'Marketing', value: 'Marketing' },
  ];

  const skillOptions = [
    'Writing', 'SEO', 'Photoshop', 'Figma', 'Video Editing',
    'Social Media', 'English', 'Vietnamese', 'React', 'Node.js',
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'reward_high', label: 'Thưởng cao' },
    { value: 'reward_low', label: 'Thưởng thấp' },
    { value: 'deadline', label: 'Sắp hết hạn' },
  ];

  const activeFiltersCount = (minReward ? 1 : 0) + (maxReward ? 1 : 0) + selectedSkills.length;

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setMinReward('');
    setMaxReward('');
    setSelectedSkills([]);
    setSortBy('newest');
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <>
      <Head>
        <title>Khám phá Tasks - VEarn</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] 
                         bg-accent-500/[0.05] blur-[120px] rounded-full" />
        </div>

        {/* Nav */}
        <motion.nav
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease }}
          className="sticky top-0 z-50 h-14 border-b border-white/[0.06] bg-[#0a0f1a]/80 backdrop-blur-xl"
        >
          <div className="mx-auto h-full max-w-6xl flex items-center justify-between px-4 sm:px-6">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              {session ? (
                <Link href="/dashboard" className="btn-primary h-9 px-4">
                  Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost hidden sm:flex">
                    Đăng nhập
                  </Link>
                  <Link href="/auth/register" className="btn-primary h-9 px-4">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.nav>

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="mb-6"
          >
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Khám phá Tasks
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {data?.pagination?.total || 0} tasks đang mở
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease }}
            className="mb-6"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium pl-9"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary h-10 px-3 relative
                           ${showFilters || activeFiltersCount > 0 ? 'border-accent-500/30 bg-accent-500/10' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Bộ lọc</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-500 
                                  text-[10px] font-medium text-white flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-premium w-auto pr-8 text-[13px]"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0a0f1a]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2, ease }}
                className="mt-3 glass-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-white">Bộ lọc nâng cao</span>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearAllFilters} className="text-[12px] text-accent-400 hover:text-accent-300">
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-1.5">Mức thưởng (VNĐ)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Từ"
                        value={minReward}
                        onChange={(e) => setMinReward(e.target.value)}
                        className="input-premium text-[13px]"
                      />
                      <span className="text-slate-600">-</span>
                      <input
                        type="number"
                        placeholder="Đến"
                        value={maxReward}
                        onChange={(e) => setMaxReward(e.target.value)}
                        className="input-premium text-[13px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] text-slate-500 mb-1.5">Kỹ năng</label>
                    <div className="flex flex-wrap gap-1.5">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`h-7 px-2.5 text-[11px] font-medium rounded-md transition-colors
                                    ${selectedSkills.includes(skill)
                                      ? 'bg-accent-500 text-white'
                                      : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active filters */}
            {(activeFiltersCount > 0 || search) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {search && (
                  <span className="badge-accent text-[11px]">
                    &quot;{search}&quot;
                    <button onClick={() => setSearch('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {minReward && (
                  <span className="badge-accent text-[11px]">
                    Từ {parseInt(minReward).toLocaleString()}đ
                    <button onClick={() => setMinReward('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {maxReward && (
                  <span className="badge-accent text-[11px]">
                    Đến {parseInt(maxReward).toLocaleString()}đ
                    <button onClick={() => setMaxReward('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedSkills.map((skill) => (
                  <span key={skill} className="badge-violet text-[11px]">
                    {skill}
                    <button onClick={() => toggleSkill(skill)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease }}
            className="-mx-4 px-4 overflow-x-auto mb-6"
          >
            <div className="flex gap-1.5 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`shrink-0 h-8 px-3.5 text-[12px] font-medium rounded-lg transition-all
                            ${category === cat.value
                              ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                              : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          {!isLoading && (
            <p className="text-[12px] text-slate-500 mb-4">
              {filteredAndSortedTasks.length} kết quả
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TaskSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-[14px] font-medium text-white mb-1">Không tìm thấy</p>
              <p className="text-[13px] text-slate-500 mb-4">Thử điều chỉnh bộ lọc</p>
              <button onClick={clearAllFilters} className="btn-secondary h-9 px-4 text-[13px]">
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedTasks.map((task: any, i: number) => (
                <TaskCard key={task.id} task={task} delay={i * 0.03} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TaskCard({ task, delay }: { task: any; delay: number }) {
  const daysLeft = task.deadline
    ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
    >
      <Link
        href={`/tasks/${task.slug || task.id}`}
        className="glass-card-hover group flex h-full flex-col overflow-hidden"
      >
        <div className="relative h-36 w-full shrink-0 bg-white/[0.04]">
          {task.coverImageUrl ? (
            <Image
              src={task.coverImageUrl}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={
                typeof task.coverImageUrl === 'string' &&
                task.coverImageUrl.startsWith('http://')
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Briefcase className="h-10 w-10 text-accent-400/25" />
            </div>
          )}
          <span
            className={`absolute right-2 top-2 ${task.status === 'OPEN' ? 'badge-emerald' : 'badge-slate'}`}
          >
            {task.status === 'OPEN' ? 'Mở' : 'Đóng'}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[14px] font-medium text-white line-clamp-2 mb-2 
                      group-hover:text-accent-400 transition-colors">
          {task.title}
        </h3>

        <p className="text-[12px] text-slate-500 line-clamp-2 mb-4">
          {task.description?.replace(/<[^>]*>/g, '').slice(0, 100)}...
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-400">
            <DollarSign className="h-3.5 w-3.5" />
            {new Intl.NumberFormat('vi-VN').format(task.reward)}đ
          </span>
          {daysLeft !== null && daysLeft > 0 && (
            <span className={`inline-flex items-center gap-1 text-[12px] 
                            ${daysLeft <= 3 ? 'text-rose-400' : 'text-slate-500'}`}>
              <Clock className="h-3.5 w-3.5" />
              {daysLeft}d
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[12px] text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {task._count?.assignees || 0}/{task.maxAssignees}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm rounded-md">
              {task.creator?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <div>
              <p className="text-[12px] font-medium text-white line-clamp-1">
                {task.creator?.name || 'Doanh nghiệp'}
              </p>
              <p className="text-[11px] text-slate-500">{task.category || 'General'}</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-accent-400 
                                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TaskSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-36 w-full skeleton" />
      <div className="p-5">
      <div className="h-5 w-3/4 rounded skeleton mb-2" />
      <div className="h-4 w-full rounded skeleton mb-1" />
      <div className="h-4 w-2/3 rounded skeleton mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-20 rounded skeleton" />
        <div className="h-5 w-12 rounded skeleton" />
      </div>
      <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3">
        <div className="h-8 w-8 rounded-md skeleton" />
        <div className="flex-1">
          <div className="h-3 w-20 rounded skeleton mb-1" />
          <div className="h-2 w-14 rounded skeleton" />
        </div>
      </div>
      </div>
    </div>
  );
}
