import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileText,
  Loader2,
  Send,
  Hourglass,
  XCircle,
  Briefcase,
  Link as LinkIcon,
  LayoutGrid,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ReviewSection } from '@/components/ReviewSection';
import { SaveTaskButton } from '@/components/SaveTaskButton';
import { TaskCommentsSection } from '@/components/TaskCommentsSection';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

interface SidebarTaskCard {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly reward: number;
  readonly status: string;
  readonly category: string | null;
  readonly isFeatured: boolean;
}

/** Khoảng cách từ đỉnh viewport tới nội dung (đồng bộ với scroll-mt-28). */
const APPLY_FORM_SCROLL_OFFSET_PX = 112;

/**
 * Cuộn mượt tới element (easing), tôn trọng prefers-reduced-motion.
 */
const smoothScrollToElement = (element: HTMLElement, offsetTopPx: number): void => {
  if (typeof window === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetY = Math.max(
    0,
    element.getBoundingClientRect().top + window.scrollY - offsetTopPx
  );

  if (prefersReduced) {
    window.scrollTo({ top: targetY, behavior: 'auto' });
    return;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const durationMs = 720;
  let startTime: number | null = null;

  const easeOutQuart = (t: number): number => 1 - (1 - t) ** 4;

  const step = (now: number): void => {
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / durationMs);
    window.scrollTo(0, startY + distance * easeOutQuart(t));
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

export default function TaskDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [submitLinks, setSubmitLinks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [experience, setExperience] = useState('');
  const [expectedDays, setExpectedDays] = useState<number | ''>('');
  const applyFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showApplyForm) return;
    const el = applyFormRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      smoothScrollToElement(el, APPLY_FORM_SCROLL_OFFSET_PX);
    });
    return () => cancelAnimationFrame(id);
  }, [showApplyForm]);

  const { data, isLoading } = useQuery({
    queryKey: ['task', slug],
    queryFn: () => api.get(`/tasks/${slug}`).then((res) => res.data.data),
    enabled: !!slug,
  });

  const task = data;

  const { data: sidebarTasksRaw, isLoading: isSidebarTasksLoading } = useQuery({
    queryKey: ['task-detail-sidebar-tasks', task?.id],
    queryFn: async () => {
      const res = await api.get('/tasks', {
        params: {
          limit: 24,
          page: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      });
      const rows = res.data.data as SidebarTaskCard[];
      const currentId = task?.id;
      return rows.filter(
        (t) =>
          t.id !== currentId &&
          (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
      );
    },
    enabled: !!task?.id,
  });

  const sidebarTasks = sidebarTasksRaw?.slice(0, 8) ?? [];

  // Check if user has applied
  const { data: applicationData } = useQuery({
    queryKey: ['application', task?.id],
    queryFn: () => api.get(`/tasks/${task?.id}/apply`).then((res) => res.data.data),
    enabled: !!task?.id && !!session?.user?.id && session?.user?.role === 'CONTRIBUTOR',
  });

  const application = applicationData;

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: () =>
      api.post(`/tasks/${task?.id}/apply`, {
        coverLetter,
        portfolioLinks: portfolioLinks
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
        experience: experience || undefined,
        expectedDays: expectedDays || undefined,
      }),
    onSuccess: () => {
      toast.success('Ứng tuyển thành công! Vui lòng chờ doanh nghiệp duyệt.');
      setShowApplyForm(false);
      setCoverLetter('');
      setPortfolioLinks('');
      setExperience('');
      setExpectedDays('');
      queryClient.invalidateQueries({ queryKey: ['application', task?.id] });
      queryClient.invalidateQueries({ queryKey: ['task', slug] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  // Cancel application mutation
  const cancelApplicationMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${task?.id}/apply`),
    onSuccess: () => {
      toast.success('Đã hủy đơn ứng tuyển');
      queryClient.invalidateQueries({ queryKey: ['application', task?.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const unclaimMutation = useMutation({
    mutationFn: () => api.post(`/tasks/${task?.id}/unclaim`),
    onSuccess: () => {
      toast.success('Đã hủy nhận task');
      queryClient.invalidateQueries({ queryKey: ['task', slug] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post(`/tasks/${task?.id}/submit`, {
        content: submitContent,
        links: [
          ...submitLinks
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
          ...uploadedFiles.map((f) => f.url),
        ],
        files: uploadedFiles,
      }),
    onSuccess: () => {
      toast.success('Đã nộp bài thành công!');
      setShowSubmitForm(false);
      setSubmitContent('');
      setSubmitLinks('');
      setUploadedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['task', slug] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} vượt quá 10MB`);
          continue;
        }

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await api.post('/upload', {
          file: base64,
          filename: file.name,
          type: file.type,
        });

        if (response.data.success) {
          setUploadedFiles((prev) => [
            ...prev,
            { name: file.name, url: response.data.url, type: file.type },
          ]);
        }
      }
      toast.success('Upload thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload thất bại');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isCreator = !!task && session?.user?.id === task.creatorId;
  const isAssigned =
    !!task &&
    Boolean(task.assignees?.some((a: any) => a.id === session?.user?.id));

  const userSubmission = task?.submissions?.find(
    (s: any) => s.contributorId === session?.user?.id
  );
  const hasSubmitted = !!userSubmission;
  const submissionStatus = userSubmission?.status;
  const isSubmissionRejected = submissionStatus === 'REJECTED';
  const isSubmissionPending = submissionStatus === 'PENDING';
  const isSubmissionApproved = submissionStatus === 'APPROVED';

  const canSubmit = isAssigned && (!hasSubmitted || isSubmissionRejected);

  const hasApplied = !!application;
  const applicationStatus = application?.status;
  /** Đã nộp bài (chờ duyệt hoặc đã duyệt) — không hiện ứng tuyển */
  const hasNonRejectedSubmission = hasSubmitted && !isSubmissionRejected;

  const canApplyStatuses = ['OPEN', 'IN_PROGRESS'] as const;
  const canApply =
    !!task &&
    session?.user?.role === 'CONTRIBUTOR' &&
    canApplyStatuses.includes(
      task.status as (typeof canApplyStatuses)[number]
    ) &&
    !isAssigned &&
    !hasApplied &&
    !hasNonRejectedSubmission &&
    task.assignees.length < task.maxAssignees;

  useEffect(() => {
    if (!canApply) setShowApplyForm(false);
  }, [canApply]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1a]">
        <p className="mb-4 text-slate-400">Không tìm thấy task</p>
        <Link href="/tasks" className="text-accent-400 hover:text-accent-300">
          ← Quay lại danh sách tasks
        </Link>
      </div>
    );
  }

  const creatorSlug =
    task.creator?.username != null && task.creator.username !== ''
      ? task.creator.username
      : task.creator?.id;
  const creatorIntroHref =
    task.creator && creatorSlug
      ? task.creator.role === 'BUSINESS'
        ? `/doanh-nghiep/${creatorSlug}`
        : `/users/${creatorSlug}`
      : null;

  return (
    <>
      <Head>
        <title>{task.title} - VEarn</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Logo size="lg" />
            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="btn-primary"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/tasks"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách tasks
          </Link>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17.5rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
            {/* Main content — cột mô tả rộng hơn */}
            <div className="min-w-0 md:max-w-none">
              {task.coverImageUrl ? (
                <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={task.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 65vw"
                    unoptimized={
                      typeof task.coverImageUrl === 'string' &&
                      task.coverImageUrl.startsWith('http://')
                    }
                  />
                </div>
              ) : null}
              <div className="glass-card rounded-xl p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {task.isFeatured && (
                      <span className="badge-amber">
                        Nổi bật
                      </span>
                    )}
                    {task.category && (
                      <span className="rounded bg-white/5 px-2 py-1 text-xs text-slate-400">
                        {task.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <SaveTaskButton taskId={task.id} showLabel />
                    <TaskStatusBadge status={task.status} />
                  </div>
                </div>

                <h1 className="mb-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {task.title}
                </h1>

                {/* Đăng bởi — tag gọn, link tới trang giới thiệu doanh nghiệp */}
                {task.creator?.name && creatorIntroHref && (
                  <div className="mb-4">
                    <Link
                      href={creatorIntroHref}
                      className="inline-flex max-w-full items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] leading-tight text-slate-400 transition-colors hover:border-accent-500/30 hover:bg-white/[0.07] hover:text-slate-200"
                    >
                      <span className="shrink-0 text-slate-500">Đăng bởi</span>
                      <span className="min-w-0 truncate font-medium text-slate-200">
                        {task.creator.name}
                      </span>
                      {task.creator.role === 'BUSINESS' && (
                        <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          DN
                        </span>
                      )}
                      {task.creator.role === 'ADMIN' && (
                        <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          QTV
                        </span>
                      )}
                    </Link>
                  </div>
                )}

                {/* Meta */}
                <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-400">
                      {new Intl.NumberFormat('vi-VN').format(task.reward)} VND
                    </span>
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>
                        Deadline:{' '}
                        {new Date(task.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>
                      {task._count?.assignees || 0}/{task.maxAssignees} đã nhận
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="mb-3 text-base font-semibold text-white">Mô tả</h2>
                  <div className="markdown-task-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
                  </div>
                </div>

                {/* Requirements */}
                {task.requirements && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-base font-semibold text-white">
                      Yêu cầu
                    </h2>
                    <div className="markdown-task-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.requirements}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {task.skills?.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-base font-semibold text-white">
                      Kỹ năng cần thiết
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {task.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-accent-500/20 px-3 py-1 text-sm text-accent-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <TaskCommentsSection
                taskId={task.id}
                taskCreatorId={task.creatorId}
                taskStatus={task.status}
                isPublished={task.isPublished}
              />

              {/* Reviews Section - show when task is approved */}
              {task.status === 'APPROVED' && (
                <div className="mt-6">
                  <ReviewSection taskId={task.id} taskTitle={task.title} />
                </div>
              )}

              {/* Apply Form */}
              {showApplyForm && (
                <div
                  ref={applyFormRef}
                  className="mt-6 scroll-mt-28 glass-card rounded-xl p-6"
                >
                  <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <Briefcase className="h-5 w-5 text-accent-400" />
                    Ứng tuyển Task
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      applyMutation.mutate();
                    }}
                  >
                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Giới thiệu bản thân <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                        required
                        minLength={50}
                        className="input-premium w-full"
                        placeholder="Tại sao bạn phù hợp với task này? Bạn có kinh nghiệm gì liên quan? (tối thiểu 50 ký tự)"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {coverLetter.length}/50 ký tự tối thiểu
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        <LinkIcon className="mr-1 inline h-4 w-4" />
                        Portfolio / Dự án trước đây (mỗi link một dòng)
                      </label>
                      <textarea
                        value={portfolioLinks}
                        onChange={(e) => setPortfolioLinks(e.target.value)}
                        rows={2}
                        className="input-premium w-full"
                        placeholder="https://github.com/yourname&#10;https://behance.net/yourportfolio"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Kinh nghiệm liên quan
                      </label>
                      <textarea
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        rows={2}
                        className="input-premium w-full"
                        placeholder="Mô tả ngắn kinh nghiệm của bạn trong lĩnh vực này..."
                      />
                    </div>

                    <div className="mb-6">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Thời gian dự kiến hoàn thành (ngày)
                      </label>
                      <input
                        type="number"
                        value={expectedDays}
                        onChange={(e) => setExpectedDays(e.target.value ? parseInt(e.target.value) : '')}
                        min={1}
                        max={365}
                        className="input-premium w-full"
                        placeholder="Ví dụ: 5"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={applyMutation.isPending || coverLetter.length < 50}
                        className="btn-primary disabled:opacity-50"
                      >
                        {applyMutation.isPending ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="btn-secondary"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Submit Form */}
              {showSubmitForm && (
                <div className="mt-6 glass-card rounded-xl p-6">
                  <h2 className="mb-4 font-semibold text-white">
                    Nộp bài
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitMutation.mutate();
                    }}
                  >
                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Nội dung <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={submitContent}
                        onChange={(e) => setSubmitContent(e.target.value)}
                        rows={5}
                        required
                        className="input-premium w-full"
                        placeholder="Mô tả công việc đã hoàn thành..."
                      />
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Đính kèm file
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-lg border-2 border-dashed border-white/10 p-6 text-center transition hover:border-accent-400/50 hover:bg-white/5"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="mb-2 h-8 w-8 animate-spin text-accent-400" />
                            <span className="text-sm text-slate-400">
                              Đang upload...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="mb-2 h-8 w-8 text-slate-500" />
                            <span className="text-sm text-slate-400">
                              Click để chọn file hoặc kéo thả
                            </span>
                            <span className="mt-1 text-xs text-slate-500">
                              Ảnh, PDF, Word, Excel, PowerPoint, ZIP (max 10MB)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Uploaded files list */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                  <Image
                                    src={file.url}
                                    alt={file.name}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                ) : (
                                  <FileText className="h-5 w-5 text-slate-400" />
                                )}
                                <span className="truncate text-sm text-slate-300">
                                  {file.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Links bổ sung (mỗi link một dòng)
                      </label>
                      <textarea
                        value={submitLinks}
                        onChange={(e) => setSubmitLinks(e.target.value)}
                        rows={2}
                        className="input-premium w-full"
                        placeholder="https://drive.google.com/file/...&#10;https://figma.com/design/..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitMutation.isPending || isUploading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubmitForm(false);
                          setUploadedFiles([]);
                        }}
                        className="btn-secondary"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar — task đang mở trên hệ thống + hành động */}
            <div className="min-w-0 space-y-6 md:pt-1">
              <div className="glass-card rounded-xl p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <LayoutGrid className="h-4 w-4 text-accent-400" />
                  Việc đang mở
                </h2>
                <p className="mb-3 text-xs text-slate-500">
                  Các task đang tuyển khác trên VEarn (trừ task bạn đang xem).
                </p>
                {isSidebarTasksLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 animate-pulse rounded-lg bg-white/[0.06]"
                      />
                    ))}
                  </div>
                ) : sidebarTasks.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {sidebarTasks.map((t) => (
                        <li key={t.id}>
                          <Link
                            href={`/tasks/${t.slug}`}
                            className="block rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-accent-500/25 hover:bg-white/[0.04]"
                          >
                            <p className="line-clamp-2 text-sm font-medium text-slate-200">
                              {t.title}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium text-green-400/90">
                                {new Intl.NumberFormat('vi-VN').format(t.reward)} đ
                              </span>
                              {t.category && (
                                <span className="rounded bg-white/5 px-1.5 py-px text-[10px] text-slate-400">
                                  {t.category}
                                </span>
                              )}
                              {t.isFeatured && (
                                <span className="text-[10px] text-amber-400/90">Nổi bật</span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/tasks"
                      className="mt-3 block text-center text-xs font-medium text-accent-400 hover:text-accent-300"
                    >
                      Xem tất cả tasks
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Hiện chưa có task đang mở khác.{' '}
                    <Link href="/tasks" className="text-accent-400 hover:text-accent-300">
                      Về danh sách
                    </Link>
                  </p>
                )}
              </div>

              {/* Actions */}
              {!isCreator && session && session.user.role === 'CONTRIBUTOR' && (
                <div className="glass-card rounded-xl p-5">
                  {/* Can apply - show apply button */}
                  {canApply && !showApplyForm && (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="btn-primary w-full"
                    >
                      <Send className="mr-2 inline h-5 w-5" />
                      Ứng tuyển Task
                    </button>
                  )}

                  {/* Application pending */}
                  {hasApplied && applicationStatus === 'PENDING' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-400">
                        <Hourglass className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Đơn ứng tuyển đang chờ duyệt
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Đã gửi: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                      </p>
                      <button
                        onClick={() => cancelApplicationMutation.mutate()}
                        disabled={cancelApplicationMutation.isPending}
                        className="w-full rounded-lg border border-red-500/30 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Hủy đơn ứng tuyển
                      </button>
                    </div>
                  )}

                  {/* Application rejected */}
                  {hasApplied && applicationStatus === 'REJECTED' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Đơn ứng tuyển bị từ chối
                        </span>
                      </div>
                      {application.feedback && (
                        <div className="rounded-lg bg-white/5 p-3">
                          <p className="mb-1 text-xs font-medium text-slate-500">Phản hồi:</p>
                          <p className="text-sm text-slate-300">{application.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned - can submit or resubmit */}
                  {isAssigned && canSubmit && !showSubmitForm && (
                    <div className="space-y-3">
                      {isSubmissionRejected ? (
                        <>
                          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-rose-400">
                            <XCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              Submission bị từ chối
                            </span>
                          </div>
                          {userSubmission?.feedback && (
                            <div className="rounded-lg bg-white/5 p-3">
                              <p className="mb-1 text-xs font-medium text-slate-500">Phản hồi:</p>
                              <p className="text-sm text-slate-300">{userSubmission.feedback}</p>
                            </div>
                          )}
                          <button
                            onClick={() => setShowSubmitForm(true)}
                            className="btn-primary w-full"
                          >
                            <Send className="mr-2 inline h-4 w-4" />
                            Nộp lại
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              Bạn đã được duyệt làm task này
                            </span>
                          </div>
                          <button
                            onClick={() => setShowSubmitForm(true)}
                            className="btn-primary w-full"
                          >
                            Nộp bài
                          </button>
                          <button
                            onClick={() => unclaimMutation.mutate()}
                            disabled={unclaimMutation.isPending}
                            className="w-full rounded-lg border border-red-500/30 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Hủy nhận task
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Submission pending review */}
                  {isSubmissionPending && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-400">
                      <Hourglass className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Submission đang chờ duyệt
                      </span>
                    </div>
                  )}

                  {/* Submission approved */}
                  {isSubmissionApproved && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Task đã hoàn thành!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!session && (
                <div className="glass-card rounded-xl p-5">
                  <p className="mb-3 text-sm text-slate-400">
                    Đăng nhập để ứng tuyển task này
                  </p>
                  <Link
                    href="/auth/login"
                    className="btn-primary inline-flex w-full items-center justify-center"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}

              {/* Creator view - link to applications */}
              {isCreator && (
                <div className="glass-card rounded-xl p-5">
                  <Link
                    href={`/dashboard/tasks/${task.id}/applications`}
                    className="btn-primary inline-flex w-full items-center justify-center"
                  >
                    Xem đơn ứng tuyển
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const styles = {
    OPEN: 'badge-emerald',
    IN_PROGRESS: 'badge-accent',
    SUBMITTED: 'badge-amber',
    APPROVED: 'badge-violet',
    CLOSED: 'badge-rose',
  };

  const labels = {
    OPEN: 'Đang mở',
    IN_PROGRESS: 'Đang làm',
    SUBMITTED: 'Đã nộp',
    APPROVED: 'Hoàn thành',
    CLOSED: 'Đã đóng',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        styles[status as keyof typeof styles] || 'badge-rose'
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
