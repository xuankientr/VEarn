'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewSectionProps {
  taskId: string;
  taskTitle?: string;
}

interface PendingReviewUser {
  readonly userId: string;
  readonly name: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  reviewee: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
}

export function ReviewSection({ taskId, taskTitle }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['taskReviews', taskId],
    queryFn: () => api.get(`/tasks/${taskId}/reviews`).then((res) => res.data.data),
    enabled: !!taskId,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post('/reviews', {
        taskId,
        revieweeId: selectedUser?.userId,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã gửi đánh giá!');
      setShowForm(false);
      setSelectedUser(null);
      setRating(5);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['taskReviews', taskId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const reviews: Review[] = data?.reviews || [];
  const canReview = data?.canReview || false;
  const pendingReviews = data?.pendingReviews || [];

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-white/10 rounded" />
          <div className="h-20 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-white">
          Đánh giá ({reviews.length})
        </h3>
        {canReview && !showForm && (
          <button
            onClick={() => {
              if (pendingReviews.length === 1) {
                setSelectedUser(pendingReviews[0]);
              }
              setShowForm(true);
            }}
            className="btn-secondary h-8 px-3 text-[12px]"
          >
            <Star className="h-3.5 w-3.5" />
            Đánh giá
          </button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              {/* User selection if multiple */}
              {pendingReviews.length > 1 && !selectedUser && (
                <div className="mb-4">
                  <p className="text-[13px] text-slate-400 mb-2">Chọn người để đánh giá:</p>
                  <div className="flex flex-wrap gap-2">
                    {pendingReviews.map((user: PendingReviewUser) => (
                      <button
                        key={user.userId}
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-[13px] text-white 
                                  hover:bg-white/[0.08] transition-colors"
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(selectedUser || pendingReviews.length === 1) && (
                <>
                  <p className="text-[13px] text-slate-400 mb-3">
                    Đánh giá <span className="text-white font-medium">{selectedUser?.name || pendingReviews[0]?.name}</span>
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-[13px] text-slate-400">
                      {rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Nhận xét (tùy chọn)..."
                    rows={3}
                    className="input-premium w-full mb-3"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                      className="btn-primary h-9 px-4 text-[13px]"
                    >
                      {submitMutation.isPending ? (
                        <div className="spinner !h-4 !w-4" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Gửi đánh giá
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setSelectedUser(null);
                      }}
                      className="btn-ghost h-9 px-4 text-[13px]"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-6">
          <Star className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-[13px] text-slate-500">Chưa có đánh giá</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-start gap-3">
        {review.reviewer.avatar ? (
          <Image
            src={review.reviewer.avatar}
            alt={review.reviewer.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-accent-500/20 flex items-center justify-center text-[13px] font-medium text-accent-400">
            {review.reviewer.name[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-white">
              {review.reviewer.name}
            </span>
            <span className="text-[11px] text-slate-500">
              → {review.reviewee.name}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= review.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="text-[13px] text-slate-400 mt-1">{review.comment}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-2">
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Standalone component for showing user rating summary
export function UserRatingSummary({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['userReviews', userId],
    queryFn: () => api.get(`/users/${userId}/reviews`).then((res) => res.data.data),
    enabled: !!userId,
  });

  if (isLoading || !data) return null;

  const { stats } = data;

  if (stats.totalReviews === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
      <span className="text-[13px] font-medium text-white">
        {stats.averageRating.toFixed(1)}
      </span>
      <span className="text-[12px] text-slate-500">
        ({stats.totalReviews} đánh giá)
      </span>
    </div>
  );
}
