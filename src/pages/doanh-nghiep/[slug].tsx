import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ExternalLink,
  Globe,
  MapPin,
  DollarSign,
} from 'lucide-react';

interface PublicUserProfile {
  readonly id: string;
  readonly name: string;
  readonly username: string | null;
  readonly avatar: string | null;
  readonly bio: string | null;
  readonly role: string;
  readonly isVerified: boolean;
  readonly createdAt: string;
  readonly company: string | null;
  readonly website: string | null;
  readonly location: string | null;
  readonly socialLinks: unknown;
  readonly _count: {
    readonly createdTasks: number;
  };
  readonly stats: {
    readonly completedTasks: number;
  };
}

interface TaskListItem {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly reward: number;
  readonly status: string;
  readonly category: string | null;
}

const normalizeWebsiteHref = (url: string): string => {
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
};

const parseSocialLinks = (raw: unknown): ReadonlyArray<{ readonly label: string; readonly href: string }> => {
  if (!raw || typeof raw !== 'object') return [];
  const out: { label: string; href: string }[] = [];
  const entries = Object.entries(raw as Record<string, unknown>);
  for (const [key, value] of entries) {
    if (typeof value !== 'string' || !value.trim()) continue;
    out.push({ label: key, href: normalizeWebsiteHref(value) });
  }
  return out;
};

export default function BusinessPublicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const { data: business, isLoading, isError } = useQuery({
    queryKey: ['business-public', slugStr],
    queryFn: async () => {
      const res = await api.get<{ data: PublicUserProfile }>(`/users/${slugStr}`);
      return res.data.data;
    },
    enabled: !!slugStr,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['business-tasks', business?.id],
    queryFn: async () => {
      const res = await api.get<{ data: TaskListItem[] }>('/tasks', {
        params: {
          creatorId: business?.id,
          limit: 24,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      });
      return res.data.data;
    },
    enabled: !!business?.id && business.role === 'BUSINESS',
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
      </div>
    );
  }

  if (isError || !business || business.role !== 'BUSINESS') {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Logo size="lg" />
            <Link href="/tasks" className="btn-primary text-sm">
              Xem tasks
            </Link>
          </div>
        </nav>
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
          <Building2 className="mb-4 h-14 w-14 text-slate-600" />
          <h1 className="mb-2 text-xl font-semibold text-white">Không tìm thấy doanh nghiệp</h1>
          <p className="mb-6 text-slate-400">
            Hồ sơ không tồn tại hoặc đây không phải tài khoản doanh nghiệp.
          </p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách tasks
          </Link>
        </div>
      </div>
    );
  }

  const displayName = business.company?.trim() || business.name;
  const socials = parseSocialLinks(business.socialLinks);
  const openTasks =
    tasksData?.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS') ?? [];
  const otherTasks = tasksData?.filter((t) => t.status !== 'OPEN' && t.status !== 'IN_PROGRESS') ?? [];

  return (
    <>
      <Head>
        <title>{displayName} — Doanh nghiệp trên VEarn</title>
        <meta
          name="description"
          content={
            business.bio?.slice(0, 160) ||
            `Giới thiệu ${displayName} và các công việc đang mở trên VEarn.`
          }
        />
      </Head>

      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Logo size="lg" />
            <Link href="/tasks" className="btn-primary text-sm">
              Khám phá tasks
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Link
            href="/tasks"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách tasks
          </Link>

          <div className="glass-card overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {business.avatar ? (
                  <Image
                    src={business.avatar}
                    alt=""
                    width={112}
                    height={112}
                    className="h-28 w-28 rounded-2xl border border-white/10 object-cover"
                    unoptimized={
                      typeof business.avatar === 'string' && business.avatar.startsWith('http://')
                    }
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/40 to-teal-600/30 text-3xl font-bold text-white">
                    {displayName[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {displayName}
                  </h1>
                  {business.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Xác minh
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <Briefcase className="h-3 w-3" />
                    Doanh nghiệp
                  </span>
                </div>

                {business.company?.trim() && business.company.trim() !== business.name && (
                  <p className="mt-1 text-slate-400">Đại diện: {business.name}</p>
                )}

                {business.username && (
                  <p className="mt-1 font-mono text-sm text-slate-500">@{business.username}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                  {business.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                      {business.location}
                    </span>
                  )}
                  {business.website?.trim() && (
                    <a
                      href={normalizeWebsiteHref(business.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-accent-400 hover:text-accent-300"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      Website
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  )}
                </div>

                {socials.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300 hover:border-white/15 hover:text-white"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}

                {business.bio?.trim() && (
                  <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">
                    {business.bio.trim()}
                  </p>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-2xl font-semibold tabular-nums text-white">
                      {business._count?.createdTasks ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">Task đã đăng</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-2xl font-semibold tabular-nums text-white">
                      {business.stats?.completedTasks ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">Task hoàn thành</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm text-slate-300">
                        {new Date(business.createdAt).toLocaleDateString('vi-VN', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Tham gia nền tảng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {openTasks.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-semibold text-white">Việc đang mở</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {openTasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks/${t.slug}`}
                      className="glass-card block rounded-xl p-4 transition-colors hover:border-white/15"
                    >
                      <p className="font-medium text-white line-clamp-2">{t.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <DollarSign className="h-4 w-4" />
                          {new Intl.NumberFormat('vi-VN').format(t.reward)} VND
                        </span>
                        {t.category && (
                          <span className="rounded bg-white/5 px-2 py-0.5 text-xs">{t.category}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {otherTasks.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-semibold text-white">Task khác từ doanh nghiệp</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {otherTasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks/${t.slug}`}
                      className="block rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10"
                    >
                      <p className="font-medium text-slate-200 line-clamp-2">{t.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{t.status}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tasksData?.length === 0 && (
            <p className="mt-10 text-center text-slate-500">
              Chưa có task công khai nào từ doanh nghiệp này.
            </p>
          )}
        </main>
      </div>
    </>
  );
}
