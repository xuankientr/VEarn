'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Bookmark } from 'lucide-react';
import { motion } from 'motion/react';

interface SaveTaskButtonProps {
  taskId: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function SaveTaskButton({ taskId, size = 'md', showLabel = false }: SaveTaskButtonProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['savedTask', taskId],
    queryFn: () => api.get(`/saved-tasks/${taskId}`).then((res) => res.data.data),
    enabled: !!session?.user,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/saved-tasks', { taskId }),
    onSuccess: () => {
      queryClient.setQueryData(['savedTask', taskId], { isSaved: true });
      queryClient.invalidateQueries({ queryKey: ['savedTasks'] });
      toast.success('Đã lưu task');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => api.delete(`/saved-tasks/${taskId}`),
    onSuccess: () => {
      queryClient.setQueryData(['savedTask', taskId], { isSaved: false });
      queryClient.invalidateQueries({ queryKey: ['savedTasks'] });
      toast.success('Đã bỏ lưu');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  if (!session) return null;

  const isSaved = data?.isSaved || false;
  const isPending = saveMutation.isPending || unsaveMutation.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`btn-ghost flex items-center gap-2 ${size === 'sm' ? 'h-8 px-3 text-[12px]' : 'h-9 px-4 text-[13px]'}`}
      >
        <motion.div
          animate={{ scale: isSaved ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            className={`${iconSize} ${isSaved ? 'fill-accent-400 text-accent-400' : ''}`}
          />
        </motion.div>
        {isSaved ? 'Đã lưu' : 'Lưu'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`btn-icon ${buttonSize}`}
      title={isSaved ? 'Bỏ lưu' : 'Lưu task'}
    >
      <motion.div
        animate={{ scale: isSaved ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          className={`${iconSize} ${isSaved ? 'fill-accent-400 text-accent-400' : ''}`}
        />
      </motion.div>
    </button>
  );
}
