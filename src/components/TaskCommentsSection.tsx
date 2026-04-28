'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  MessageCircle,
  Send,
  Loader2,
  Reply,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

export interface TaskCommentsSectionProps {
  readonly taskId: string;
  readonly taskCreatorId: string;
  readonly taskStatus: string;
  readonly isPublished: boolean;
}

interface TaskCommentRow {
  readonly id: string;
  readonly body: string;
  readonly parentId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly username: string | null;
    readonly avatar: string | null;
    readonly role: string;
  };
}

function formatCommentDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function wasEdited(row: TaskCommentRow): boolean {
  return (
    new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime() >
    1000
  );
}

export function TaskCommentsSection({
  taskId,
  taskCreatorId,
  taskStatus,
  isPublished,
}: TaskCommentsSectionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const viewerId = session?.user?.id;
  const viewerRole = session?.user?.role;

  const canPost =
    isPublished &&
    taskStatus !== 'DRAFT' &&
    taskStatus !== 'CLOSED' &&
    !!viewerId;

  const canModerate =
    viewerId === taskCreatorId || viewerRole === 'ADMIN';

  const { data: comments, isLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () =>
      api
        .get(`/tasks/${taskId}/comments`)
        .then((res) => res.data.data as TaskCommentRow[]),
    enabled: !!taskId,
  });

  const invalidate = (): void => {
    queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
  };

  const postMutation = useMutation({
    mutationFn: (payload: { readonly body: string; readonly parentId?: string }) =>
      api.post(`/tasks/${taskId}/comments`, payload),
    onSuccess: () => {
      toast.success('Đã gửi bình luận');
      setDraft('');
      setReplyingToId(null);
      setReplyDraft('');
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const patchMutation = useMutation({
    mutationFn: (payload: { readonly id: string; readonly body: string }) =>
      api.patch(`/tasks/${taskId}/comments/${payload.id}`, {
        body: payload.body,
      }),
    onSuccess: () => {
      toast.success('Đã cập nhật bình luận');
      setEditingId(null);
      setEditDraft('');
      invalidate();
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/tasks/${taskId}/comments/${commentId}`),
    onSuccess: () => {
      toast.success('Đã xóa bình luận');
      if (editingId) {
        setEditingId(null);
        setEditDraft('');
      }
      invalidate();
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const flat = comments ?? [];

  const { roots, replyByParent } = useMemo(() => {
    const rootList: TaskCommentRow[] = [];
    const map = new Map<string, TaskCommentRow[]>();

    for (const c of flat) {
      if (c.parentId == null) {
        rootList.push(c);
        continue;
      }
      const list = map.get(c.parentId) ?? [];
      list.push(c);
      map.set(c.parentId, list);
    }

    map.forEach((arr) => {
      arr.sort(
        (a: TaskCommentRow, b: TaskCommentRow) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    return { roots: rootList, replyByParent: map };
  }, [flat]);

  const totalCount = flat.length;

  const renderCommentBody = (
    c: TaskCommentRow,
    options: { readonly isReply: boolean }
  ): JSX.Element => {
    const isAuthor = viewerId === c.user.id;
    const showDelete = isAuthor || canModerate;
    const showEdit = isAuthor;
    const isEditing = editingId === c.id;

    if (isEditing) {
      return (
        <div className="mt-2 space-y-2">
          <textarea
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            rows={3}
            maxLength={5000}
            disabled={patchMutation.isPending}
            className="input-premium w-full resize-y text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                patchMutation.isPending || !editDraft.trim()
              }
              onClick={() => {
                const t = editDraft.trim();
                if (!t) return;
                patchMutation.mutate({ id: c.id, body: t });
              }}
              className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-accent-400 disabled:opacity-50"
            >
              {patchMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Lưu'
              )}
            </button>
            <button
              type="button"
              disabled={patchMutation.isPending}
              onClick={() => {
                setEditingId(null);
                setEditDraft('');
              }}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              Hủy
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-200">
          {c.body}
        </p>
        {wasEdited(c) && (
          <p className="mt-1 text-xs text-slate-500">(đã chỉnh sửa)</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {canPost && !options.isReply && (
            <button
              type="button"
              onClick={() => {
                setReplyingToId((prev) => (prev === c.id ? null : c.id));
                setReplyDraft('');
              }}
              className="inline-flex items-center gap-1 text-xs text-accent-400 hover:underline"
            >
              {replyingToId === c.id ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  Đóng trả lời
                </>
              ) : (
                <>
                  <Reply className="h-3.5 w-3.5" />
                  Trả lời
                </>
              )}
            </button>
          )}
          {showEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingId(c.id);
                setEditDraft(c.body);
                setReplyingToId(null);
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
              Sửa
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (
                  !window.confirm(
                    'Xóa bình luận này? Các trả lời (nếu có) cũng sẽ bị xóa.'
                  )
                ) {
                  return;
                }
                deleteMutation.mutate(c.id);
              }}
              className="inline-flex items-center gap-1 text-xs text-red-400/90 hover:text-red-300 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </button>
          )}
        </div>
      </>
    );
  };

  const renderAvatarAndMeta = (c: TaskCommentRow): JSX.Element => (
    <div className="mb-2 flex items-start gap-3">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-700">
        {c.user.avatar ? (
          <Image
            src={c.user.avatar}
            alt=""
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-300">
            {c.user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="font-medium text-white">{c.user.name}</span>
          {c.user.username && (
            <span className="text-xs text-slate-500">@{c.user.username}</span>
          )}
          <span className="text-xs text-slate-500">
            · {formatCommentDate(c.createdAt)}
          </span>
        </div>
        {renderCommentBody(c, { isReply: c.parentId != null })}
      </div>
    </div>
  );

  return (
    <div className="glass-card mt-6 rounded-xl p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-white">
        <MessageCircle className="h-5 w-5 text-accent-400" />
        Bình luận ({totalCount})
      </h3>

      {canPost && (
        <form
          className="mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            const text = draft.trim();
            if (!text) {
              toast.error('Vui lòng nhập nội dung');
              return;
            }
            postMutation.mutate({ body: text });
          }}
        >
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Thảo luận / hỏi đáp về task
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={5000}
            disabled={postMutation.isPending}
            className="input-premium mb-2 w-full resize-y"
            placeholder="Viết câu hỏi hoặc góp ý… (tối đa 5000 ký tự)"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{draft.length}/5000</span>
            <button
              type="submit"
              disabled={postMutation.isPending || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-accent-400 disabled:opacity-50"
            >
              {postMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Gửi
            </button>
          </div>
        </form>
      )}

      {!session?.user && (
        <p className="mb-4 text-sm text-slate-400">
          <Link href="/auth/login" className="text-accent-400 hover:underline">
            Đăng nhập
          </Link>{' '}
          để tham gia bình luận.
        </p>
      )}

      {session?.user && !canPost && (
        <p className="mb-4 text-sm text-slate-500">
          Task nháp hoặc đã đóng — không thể thêm bình luận mới.
        </p>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 rounded-lg bg-white/5" />
          <div className="h-16 rounded-lg bg-white/5" />
        </div>
      ) : roots.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa có bình luận nào.</p>
      ) : (
        <ul className="space-y-4">
          {roots.map((root) => (
            <li
              key={root.id}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
            >
              {renderAvatarAndMeta(root)}
              {replyingToId === root.id && canPost && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Trả lời {root.user.name}
                  </label>
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={2}
                    maxLength={5000}
                    disabled={postMutation.isPending}
                    className="input-premium mb-2 w-full resize-y text-sm"
                    placeholder="Nội dung trả lời…"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyDraft('');
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={
                        postMutation.isPending || !replyDraft.trim()
                      }
                      onClick={() => {
                        const t = replyDraft.trim();
                        if (!t) return;
                        postMutation.mutate({
                          body: t,
                          parentId: root.id,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-accent-400 disabled:opacity-50"
                    >
                      {postMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Gửi trả lời
                    </button>
                  </div>
                </div>
              )}
              {(replyByParent.get(root.id) ?? []).length > 0 && (
                <ul className="mt-3 space-y-3 border-l-2 border-accent-500/30 pl-4">
                  {(replyByParent.get(root.id) ?? []).map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-md bg-black/20 px-3 py-2"
                    >
                      {renderAvatarAndMeta(reply)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
