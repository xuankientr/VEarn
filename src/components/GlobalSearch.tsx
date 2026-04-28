'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Command,
  X,
  FileText,
  User,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  tasks: Array<{
    id: string;
    title: string;
    slug: string;
    category?: string;
    reward: number;
    status: string;
    creatorName: string;
    type: 'task';
  }>;
  users: Array<{
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    role: string;
    bio?: string;
    type: 'user';
  }>;
}

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () =>
      api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`).then((res) => res.data.data as SearchResult),
    enabled: debouncedQuery.length >= 2,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = useCallback((type: string, slug: string) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'task') {
      router.push(`/tasks/${slug}`);
    } else {
      router.push(`/users/${slug}`);
    }
  }, [router]);

  const hasResults = data && (data.tasks.length > 0 || data.users.length > 0);
  const showDropdown = isOpen && (query.length >= 2 || hasResults);

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm tasks, users..."
          className="input-premium h-9 w-full pl-9 pr-20 text-[13px]"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="h-3.5 w-3.5 text-slate-500" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 h-5
                        text-[10px] font-medium text-slate-500
                        bg-white/[0.04] border border-white/[0.08] rounded">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50
                      bg-[#0f1629] border border-white/[0.08] rounded-xl
                      shadow-xl shadow-black/40 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
              </div>
            ) : !hasResults && query.length >= 2 ? (
              <div className="py-8 text-center">
                <Search className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-[13px] text-slate-500">Không tìm thấy kết quả</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto scrollbar-premium">
                {/* Tasks */}
                {data?.tasks && data.tasks.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Tasks
                    </div>
                    {data.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelect('task', task.slug)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-lg bg-accent-500/20 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-accent-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-white truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{task.category || 'Task'}</span>
                            <span>•</span>
                            <span className="text-emerald-400">
                              {new Intl.NumberFormat('vi-VN').format(task.reward)}đ
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Users */}
                {data?.users && data.users.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2 border-t border-white/[0.06]">
                      <User className="h-3.5 w-3.5" />
                      Users
                    </div>
                    {data.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelect('user', user.username || user.id)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/[0.04] transition-colors text-left"
                      >
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-[13px] font-medium text-violet-400">
                            {user.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {user.role === 'BUSINESS' ? 'Doanh nghiệp' : user.role === 'CONTRIBUTOR' ? 'Contributor' : user.role}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* View all link */}
                {hasResults && (
                  <Link
                    href={`/tasks?search=${encodeURIComponent(query)}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="block px-3 py-2.5 text-center text-[12px] text-accent-400 hover:text-accent-300 
                              border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                  >
                    {`Xem tất cả kết quả cho "${query}"`}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
