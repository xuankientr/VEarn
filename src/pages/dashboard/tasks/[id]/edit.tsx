import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  Users,
  Tag,
  FileText,
  Sparkles,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { TaskCoverImageField } from '@/components/task-cover-image-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';

const CATEGORIES = [
  'Content Writing',
  'Graphic Design',
  'Translation',
  'Data Entry',
  'Social Media',
  'Video Editing',
  'Web Development',
  'Marketing',
  'Research',
  'Other',
];

const SKILL_OPTIONS = [
  'Writing',
  'SEO',
  'Photoshop',
  'Illustrator',
  'Figma',
  'Video Editing',
  'Social Media',
  'English',
  'Vietnamese',
  'Japanese',
  'Chinese',
  'Korean',
  'Data Entry',
  'Excel',
  'Research',
  'Marketing',
  'React',
  'Node.js',
  'Python',
];

export default function EditTaskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    reward: '',
    deadline: '',
    maxAssignees: '1',
    category: '',
    skills: [] as string[],
    isFeatured: false,
    isPublished: true,
    status: 'DRAFT',
    coverImageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: task, isLoading } = useQuery({
    queryKey: ['task-edit', id],
    queryFn: () => api.get(`/tasks/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        requirements: task.requirements || '',
        reward: task.reward?.toString() || '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        maxAssignees: task.maxAssignees?.toString() || '1',
        category: task.category || '',
        skills: task.skills || [],
        isFeatured: task.isFeatured || false,
        isPublished: task.isPublished || false,
        status: task.status || 'DRAFT',
        coverImageUrl: task.coverImageUrl || '',
      });
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/tasks/${id}`, data),
    onSuccess: () => {
      toast.success('Cập nhật task thành công!');
      queryClient.invalidateQueries({ queryKey: ['task-edit', id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      router.push('/dashboard/tasks');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      toast.success('Đã xóa task');
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      router.push('/dashboard/tasks');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Mô tả phải có ít nhất 50 ký tự';
    }

    if (!formData.reward || parseFloat(formData.reward) <= 0) {
      newErrors.reward = 'Vui lòng nhập mức thưởng hợp lệ';
    }

    const maxAssignees = parseInt(formData.maxAssignees);
    if (isNaN(maxAssignees) || maxAssignees < 1 || maxAssignees > 100) {
      newErrors.maxAssignees = 'Số người nhận phải từ 1-100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    updateMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim() || null,
      reward: parseFloat(formData.reward),
      deadline: formData.deadline || null,
      maxAssignees: parseInt(formData.maxAssignees),
      category: formData.category || null,
      skills: formData.skills,
      isFeatured: formData.isFeatured,
      isPublished: formData.isPublished,
      status: formData.isPublished ? 'OPEN' : 'DRAFT',
      coverImageUrl:
        formData.coverImageUrl.trim() === ''
          ? null
          : formData.coverImageUrl.trim(),
    });
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa task này? Hành động này không thể hoàn tác.')) {
      deleteMutation.mutate();
    }
  };

  if (session?.user?.role === 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="mb-4 text-slate-400">
            Chỉ tài khoản Business mới có thể chỉnh sửa task
          </p>
          <Link
            href="/dashboard"
            className="text-accent-400 hover:text-accent-300"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không tìm thấy task
          </h2>
          <Link
            href="/dashboard/tasks"
            className="text-accent-400 hover:text-accent-300"
          >
            ← Quay lại danh sách tasks
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Chỉnh sửa Task - VEarn</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/tasks"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
            <h1 className="page-title">Chỉnh sửa Task</h1>
            <p className="mt-1 text-slate-400">
              Cập nhật thông tin task của bạn
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Xóa Task
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <FileText className="h-5 w-5 text-accent-400" />
              Thông tin cơ bản
            </h2>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Tiêu đề task <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={200}
                  className={`input-premium w-full ${
                    errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Danh mục
                </label>
                <Select
                  value={formData.category === '' ? undefined : formData.category}
                  onValueChange={(v) => {
                    setFormData((prev) => ({ ...prev, category: v }));
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: '' }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      'input-premium h-11 w-full justify-between text-left text-[13px] text-white shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-slate-500 [&>svg]:text-slate-400',
                      errors.category
                        ? 'border-red-500 focus:border-red-500'
                        : '',
                    )}
                  >
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={6}
                    className="z-[300] max-h-[min(280px,50vh)] overflow-y-auto rounded-xl border border-white/10 bg-[#0c1222]/98 text-slate-100 shadow-2xl backdrop-blur-xl"
                  >
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="cursor-pointer rounded-lg py-2.5 pl-3 pr-8 text-[13px] text-slate-200 focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white data-[state=checked]:bg-accent-500/15"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TaskCoverImageField
                value={formData.coverImageUrl}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, coverImageUrl: url }))
                }
                disabled={updateMutation.isPending}
              />

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`input-premium w-full resize-none ${
                    errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Yêu cầu (không bắt buộc)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={3}
                  className="input-premium w-full resize-none"
                />
              </div>
            </div>
          </div>

          {/* Reward & Settings */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <DollarSign className="h-5 w-5 text-green-500" />
              Thưởng & Cài đặt
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Reward */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Mức thưởng (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="reward"
                    value={formData.reward}
                    onChange={handleChange}
                    min="0"
                    step="10000"
                    className={`input-premium w-full pl-10 ${
                      errors.reward ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
                {errors.reward && (
                  <p className="mt-1 text-sm text-red-500">{errors.reward}</p>
                )}
              </div>

              {/* Max Assignees */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Số người nhận tối đa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="maxAssignees"
                    value={formData.maxAssignees}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className={`input-premium w-full pl-10 ${
                      errors.maxAssignees ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
                {errors.maxAssignees && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.maxAssignees}
                  </p>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Hạn chót
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="input-premium w-full pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {/* Status & Options */}
              <div className="flex flex-col justify-center gap-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Đánh dấu nổi bật
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Eye className="h-4 w-4 text-green-500" />
                    Công khai
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <Tag className="h-5 w-5 text-purple-500" />
              Kỹ năng yêu cầu
            </h2>

            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    formData.skills.includes(skill)
                      ? 'bg-accent-500/20 text-accent-400 ring-2 ring-accent-500'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {formData.skills.length > 0 && (
              <p className="mt-3 text-sm text-slate-400">
                Đã chọn: {formData.skills.join(', ')}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/tasks"
              className="btn-secondary"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary inline-flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
