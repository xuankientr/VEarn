'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/lib/api';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Briefcase,
  FileText,
  DollarSign,
  Send,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  MessageCircle,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=10').then((res) => res.data),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications: Notification[] = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_APPROVED':
        return <UserCheck className="h-4 w-4 text-emerald-400" />;
      case 'APPLICATION_REJECTED':
        return <UserX className="h-4 w-4 text-rose-400" />;
      case 'SUBMISSION_APPROVED':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'SUBMISSION_REJECTED':
        return <XCircle className="h-4 w-4 text-rose-400" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="h-4 w-4 text-emerald-400" />;
      case 'NEW_APPLICATION':
        return <Send className="h-4 w-4 text-accent-400" />;
      case 'NEW_SUBMISSION':
        return <FileText className="h-4 w-4 text-violet-400" />;
      case 'NEW_TASK_COMMENT':
        return <MessageCircle className="h-4 w-4 text-sky-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return then.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0a0f1a]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="dropdown-menu right-0 mt-2 w-80 sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
              <span className="text-[13px] font-semibold text-white">
                Thông báo
                {unreadCount > 0 && (
                  <span className="ml-2 text-[11px] text-accent-400">
                    ({unreadCount} mới)
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[11px] text-accent-400 hover:text-accent-300 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Đọc tất cả
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-premium">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-500">Không có thông báo</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id}>
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                        className={`block px-3 py-3 hover:bg-white/[0.04] transition-colors
                                  ${!notification.isRead ? 'bg-accent-500/[0.03]' : ''}`}
                      >
                        <NotificationContent
                          notification={notification}
                          getIcon={getIcon}
                          formatTime={formatTime}
                        />
                      </Link>
                    ) : (
                      <div
                        className={`px-3 py-3 ${!notification.isRead ? 'bg-accent-500/[0.03]' : ''}`}
                      >
                        <NotificationContent
                          notification={notification}
                          getIcon={getIcon}
                          formatTime={formatTime}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/[0.06] p-2">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-[12px] text-slate-500 hover:text-white 
                            py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationContent({
  notification,
  getIcon,
  formatTime,
}: {
  notification: Notification;
  getIcon: (type: string) => React.ReactNode;
  formatTime: (date: string) => string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white line-clamp-1">
          {notification.title}
        </p>
        <p className="text-[12px] text-slate-400 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />
      )}
    </div>
  );
}
