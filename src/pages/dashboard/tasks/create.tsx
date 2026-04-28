import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  LayoutTemplate,
  Check,
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

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  requirements?: string;
  reward?: number;
  maxAssignees: number;
  category?: string;
  skills: string[];
  isSystem: boolean;
}

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

export default function CreateTaskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templatesData } = useQuery({
    queryKey: ['taskTemplates'],
    queryFn: () => api.get('/task-templates').then((res) => res.data.data as TaskTemplate[]),
  });

  const templates = templatesData || [];

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
    coverImageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template.id);
    setFormData({
      ...formData,
      description: template.description,
      requirements: template.requirements || '',
      reward: template.reward ? String(template.reward) : '',
      maxAssignees: String(template.maxAssignees),
      category: template.category || '',
      skills: template.skills,
    });
    toast.success(`Đã áp dụng template "${template.name}"`);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tasks', data),
    onSuccess: (response) => {
      toast.success('Tạo task thành công!');
      router.push(`/tasks/${response.data.data.slug}`);
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

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
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

    createMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim() || null,
      reward: parseFloat(formData.reward),
      deadline: formData.deadline || null,
      maxAssignees: parseInt(formData.maxAssignees),
      category: formData.category,
      skills: formData.skills,
      isFeatured: formData.isFeatured,
      isPublished: formData.isPublished,
      coverImageUrl: formData.coverImageUrl.trim() || undefined,
    });
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
            Chỉ tài khoản Business mới có thể tạo task
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

  return (
    <DashboardLayout>
      <Head>
        <title>Tạo Task mới - VEarn</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Link>
          <h1 className="page-title">Tạo Task mới</h1>
          <p className="mt-1 text-slate-400">
            Điền thông tin để đăng task tìm cộng tác viên
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Templates */}
          {templates.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <LayoutTemplate className="h-5 w-5 text-violet-400" />
                Bắt đầu từ Template
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className={`p-4 rounded-lg text-left transition-all border ${
                      selectedTemplate === template.id
                        ? 'bg-accent-500/10 border-accent-500/50'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-medium text-white mb-1">
                          {template.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {template.category || 'General'}
                          {template.isSystem && ' • Mẫu hệ thống'}
                        </p>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="h-4 w-4 text-accent-400 shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="mt-3 text-[12px] text-slate-400 hover:text-white"
                >
                  Bỏ chọn template
                </button>
              )}
            </div>
          )}

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
                  placeholder="VD: Viết bài SEO về công nghệ AI"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Danh mục <span className="text-red-500">*</span>
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
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <TaskCoverImageField
                value={formData.coverImageUrl}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, coverImageUrl: url }))
                }
                disabled={createMutation.isPending}
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
                  placeholder="Mô tả chi tiết công việc cần làm. Hỗ trợ markdown: **in đậm**, - danh sách..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-right text-xs text-slate-500">
                  {formData.description.length} ký tự (tối thiểu 50)
                </p>
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
                  placeholder="Các yêu cầu đặc biệt cho người nhận task..."
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
                    placeholder="500000"
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
                  Hạn chót (không bắt buộc)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-premium w-full pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {/* Featured & Published */}
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
                    Công khai ngay
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
              href="/dashboard"
              className="btn-secondary"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary inline-flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Tạo Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
