import { useRef, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';

interface TaskCoverImageFieldProps {
  readonly value: string;
  readonly onChange: (url: string) => void;
  readonly disabled?: boolean;
}

/**
 * Upload ảnh qua `/api/upload` hoặc nhập URL; dùng cho tạo / sửa task.
 */
export function TaskCoverImageField(props: TaskCoverImageFieldProps) {
  const { value, onChange, disabled } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh vượt quá 10MB');
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await api.post('/upload', {
        file: base64,
        filename: file.name,
        type: file.type,
      });

      if (response.data.success && response.data.url) {
        onChange(response.data.url as string);
        toast.success('Đã tải ảnh lên');
      }
    } catch {
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        Ảnh minh họa <span className="text-slate-500">(tuỳ chọn)</span>
      </label>
      <p className="text-xs text-slate-500">
        Hiển thị trên thẻ task và trang chi tiết. Dùng ảnh ngang (16:9) cho đẹp nhất.
      </p>

      {value ? (
        <div className="relative aspect-video max-h-52 w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          <Image
            src={value}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 36rem"
            unoptimized={value.startsWith('http://')}
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80 disabled:opacity-50"
            aria-label="Xóa ảnh"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          disabled={disabled || uploading}
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 text-accent-400" />
          )}
          {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
        </button>
      </div>

      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">
          Hoặc dán URL ảnh
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          placeholder="https://... hoặc /uploads/..."
          className="input-premium w-full max-w-xl text-sm"
        />
      </div>
    </div>
  );
}
