/**
 * VEarn Landing Page
 * Inspired by Linear, Vercel, Arc Browser
 */

import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Briefcase,
  Users,
  DollarSign,
  CheckCircle,
  Shield,
  Zap,
  Star,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';

const ease = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>VEarn - Kiếm tiền từ kỹ năng của bạn</title>
        <meta
          name='description'
          content='VEarn - Nền tảng kết nối doanh nghiệp với cộng tác viên qua các công việc thực tế.'
        />
      </Head>

      <div className='min-h-screen bg-[#0a0f1a]'>
        {/* Subtle gradient background */}
        <div className='fixed inset-0 pointer-events-none'>
          <div
            className='absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] 
                         bg-gradient-to-b from-accent-500/[0.07] to-transparent blur-[100px] rounded-full'
          />
        </div>

        {/* Navigation */}
        <motion.nav
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease }}
          className='sticky top-0 z-50 h-14 border-b border-white/[0.06] bg-[#0a0f1a]/80 backdrop-blur-xl'
        >
          <div className='mx-auto h-full max-w-6xl flex items-center justify-between px-4 sm:px-6'>
            <Logo size='sm' />

            <div className='hidden md:flex items-center gap-1'>
              <NavLink href='/tasks'>Tasks</NavLink>
              <NavLink href='#features'>Tính năng</NavLink>
              <NavLink href='#how-it-works'>Cách hoạt động</NavLink>
            </div>

            <div className='flex items-center gap-2'>
              {session ? (
                <Link href='/dashboard' className='btn-primary h-9 px-4'>
                  Dashboard
                  <ChevronRight className='h-4 w-4' />
                </Link>
              ) : (
                <>
                  <Link href='/auth/login' className='btn-ghost hidden sm:flex'>
                    Đăng nhập
                  </Link>
                  <Link href='/auth/register' className='btn-primary h-9 px-4'>
                    Bắt đầu ngay
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.nav>

        {/* Hero */}
        <section className='relative pt-16 pb-24 sm:pt-24 sm:pb-32'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <div className='grid gap-12 lg:grid-cols-2 lg:gap-16 items-center'>
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className='text-center lg:text-left'
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, ease }}
                  className='inline-flex'
                >
                  <span
                    className='inline-flex items-center gap-2 h-7 px-3 text-[12px] font-medium
                                 text-accent-300 bg-accent-500/10 rounded-full
                                 ring-1 ring-inset ring-accent-500/20'
                  >
                    <Zap className='h-3.5 w-3.5' />
                    Nền tảng việc làm #1 Việt Nam
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease }}
                  className='mt-6 text-4xl leading-[1.12] sm:text-[2.5rem] lg:text-5xl
                            font-semibold tracking-tight text-white'
                >
                  Kiếm tiền từ{' '}
                  <span className='text-gradient'>kỹ năng thực tế</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease }}
                  className='mt-5 text-base sm:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0'
                >
                  VEarn kết nối doanh nghiệp với cộng tác viên qua các task thực
                  tế. Hoàn thành công việc, nhận tiền thưởng - đơn giản và minh
                  bạch.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25, ease }}
                  className='mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'
                >
                  <Link
                    href='/tasks'
                    className='btn-primary h-11 px-6 text-[14px]'
                  >
                    Khám phá Tasks
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                  <Link
                    href='/auth/register'
                    className='btn-secondary h-11 px-6 text-[14px]'
                  >
                    Tạo tài khoản miễn phí
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease }}
                  className='mt-10 pt-8 border-t border-white/[0.06]'
                >
                  <div className='grid grid-cols-3 gap-6'>
                    <Stat value='500+' label='Tasks hoàn thành' />
                    <Stat value='200+' label='Cộng tác viên' />
                    <Stat value='50+' label='Doanh nghiệp' />
                  </div>
                </motion.div>
              </motion.div>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className='relative hidden lg:block'
              >
                <div
                  className='absolute -inset-4 bg-gradient-to-r from-accent-500/20 to-violet-500/20 
                               rounded-3xl blur-3xl opacity-50'
                />

                <div className='relative glass-card p-6'>
                  {/* Header */}
                  <div className='flex items-center justify-between mb-5'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='h-10 w-10 rounded-lg bg-gradient-to-br from-accent-400 to-emerald-500 
                                     flex items-center justify-center'
                      >
                        <Briefcase className='h-5 w-5 text-white' />
                      </div>
                      <div>
                        <p className='text-[12px] text-slate-500'>
                          Tổng thu nhập
                        </p>
                        <p className='text-xl font-semibold text-white'>
                          12,450,000đ
                        </p>
                      </div>
                    </div>
                    <span className='badge-emerald'>
                      <TrendingUp className='h-3 w-3' />
                      +23%
                    </span>
                  </div>

                  {/* Chart */}
                  <div className='h-28 mb-5 rounded-lg bg-white/[0.02] flex items-end justify-around px-3 pb-3'>
                    {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{
                          delay: 0.4 + i * 0.08,
                          duration: 0.5,
                          ease,
                        }}
                        className='w-5 rounded bg-gradient-to-t from-accent-500/80 to-accent-400'
                      />
                    ))}
                  </div>

                  {/* Tasks */}
                  <div className='space-y-2'>
                    <p className='text-[12px] font-medium text-slate-500 mb-2'>
                      Tasks gần đây
                    </p>
                    {[
                      {
                        title: 'Viết content SEO',
                        reward: '500,000đ',
                        done: true,
                      },
                      {
                        title: 'Thiết kế Banner',
                        reward: '800,000đ',
                        done: false,
                      },
                    ].map((task, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, ease }}
                        className='flex items-center justify-between p-3 rounded-lg bg-white/[0.03]'
                      >
                        <div className='flex items-center gap-2.5'>
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${task.done ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          />
                          <span className='text-[13px] text-slate-300'>
                            {task.title}
                          </span>
                        </div>
                        <span className='text-[13px] font-medium text-accent-400'>
                          {task.reward}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, ease }}
                  style={{ y: 0 }}
                  className='absolute -top-4 -right-4 glass-card px-3 py-2'
                >
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-emerald-400' />
                    <span className='text-[13px] text-white'>
                      Task hoàn thành!
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, ease }}
                  className='absolute -bottom-3 -left-3 glass-card px-3 py-2'
                >
                  <div className='flex items-center gap-2'>
                    <DollarSign className='h-4 w-4 text-accent-400' />
                    <span className='text-[13px] text-white'>+500,000đ</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust bar — đối tác (nổi bật hơn so với nền chung) */}
        <section className='py-12 sm:py-16'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease }}
              className='relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-accent-500/[0.1] via-navy-950/90 to-[#080c14] px-6 py-10 shadow-[0_0_50px_-18px_rgba(45,212,191,0.28)] sm:px-10 sm:py-12'
            >
              <div
                className='pointer-events-none absolute inset-0 opacity-90'
                aria-hidden
              >
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(45,212,191,0.14),transparent_55%)]' />
                <div className='absolute bottom-0 left-1/2 h-px w-2/3 max-w-md -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-400/40 to-transparent' />
              </div>
              <div className='relative text-center'>
                <span className='mb-4 inline-flex items-center gap-2 rounded-full border border-accent-400/35 bg-accent-500/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-200'>
                  <Building2 className='h-3.5 w-3.5 text-accent-300' />
                  Đối tác
                </span>
                <h2 className='text-lg font-semibold tracking-tight text-white sm:text-xl md:text-2xl'>
                  Được tin tưởng bởi{' '}
                  <span className='text-gradient'>
                    các doanh nghiệp hàng đầu
                  </span>
                </h2>
                <p className='mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-slate-400 sm:text-sm'>
                  Cùng VEarn kết nối talent — minh bạch, nhanh chóng và đáng tin
                  cậy.
                </p>
                <div className='mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
                  {[
                    'TechCorp',
                    'StartupXYZ',
                    'DigitalHub',
                    'CreativeStudio',
                    'BrandAgency',
                  ].map((name) => (
                    <span
                      key={name}
                      className='rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-100 shadow-sm backdrop-blur-sm transition-colors hover:border-accent-400/35 hover:bg-white/[0.09] hover:text-white sm:px-5 sm:py-3 sm:text-[15px]'
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id='features' className='py-20 sm:py-28'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease }}
              className='text-center mb-14'
            >
              <span className='badge-accent inline-flex mb-4'>
                <Sparkles className='h-3.5 w-3.5' />
                Tính năng
              </span>
              <h2 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
                Tại sao chọn VEarn?
              </h2>
              <p className='mt-3 text-slate-400 max-w-xl mx-auto'>
                Nền tảng được thiết kế để mang lại trải nghiệm tốt nhất
              </p>
            </motion.div>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <FeatureCard
                icon={<Briefcase className='h-5 w-5' />}
                title='Đa dạng công việc'
                description='Từ viết content, thiết kế đến nhập liệu - có task cho mọi kỹ năng'
                delay={0}
              />
              <FeatureCard
                icon={<DollarSign className='h-5 w-5' />}
                title='Thanh toán nhanh'
                description='Hoàn thành task, được duyệt và nhận tiền ngay'
                delay={0.1}
              />
              <FeatureCard
                icon={<Shield className='h-5 w-5' />}
                title='An toàn & Uy tín'
                description='Hệ thống bảo mật cao, thanh toán đảm bảo'
                delay={0.2}
              />
              <FeatureCard
                icon={<CheckCircle className='h-5 w-5' />}
                title='Quy trình rõ ràng'
                description='Nhận task → Làm việc → Nộp bài → Nhận tiền'
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id='how-it-works'
          className='py-20 sm:py-28 border-t border-white/[0.04]'
        >
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className='text-center mb-14'
            >
              <h2 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
                Bắt đầu trong <span className='text-gradient'>3 bước</span>
              </h2>
              <p className='mt-3 text-slate-400'>
                Quy trình đơn giản, ai cũng có thể bắt đầu
              </p>
            </motion.div>

            <div className='grid gap-4 md:grid-cols-3'>
              <StepCard
                step='01'
                title='Đăng ký tài khoản'
                description='Tạo tài khoản miễn phí trong 30 giây'
                icon={<Users className='h-5 w-5' />}
                delay={0}
              />
              <StepCard
                step='02'
                title='Tìm & ứng tuyển'
                description='Duyệt tasks phù hợp và gửi đơn ứng tuyển'
                icon={<Briefcase className='h-5 w-5' />}
                delay={0.1}
              />
              <StepCard
                step='03'
                title='Hoàn thành & nhận tiền'
                description='Nộp bài làm, chờ duyệt và nhận thanh toán'
                icon={<DollarSign className='h-5 w-5' />}
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className='py-20 sm:py-28 border-t border-white/[0.04]'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className='text-center mb-14'
            >
              <h2 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
                Được tin tưởng bởi hàng trăm người
              </h2>
            </motion.div>

            <div className='grid gap-4 md:grid-cols-3'>
              <TestimonialCard
                content='VEarn giúp tôi tìm được công việc freelance phù hợp. Thu nhập ổn định, thanh toán nhanh!'
                author='Nguyễn Văn A'
                role='Content Writer'
                avatarUrl='https://randomuser.me/api/portraits/men/32.jpg'
                delay={0}
              />
              <TestimonialCard
                content='Tìm được nhiều cộng tác viên chất lượng. Quy trình rõ ràng, tiết kiệm thời gian.'
                author='Trần Thị B'
                role='Marketing Manager'
                avatarUrl='https://randomuser.me/api/portraits/women/44.jpg'
                delay={0.1}
              />
              <TestimonialCard
                content='Giao diện dễ sử dụng, nhiều task đa dạng. Đã kiếm được 10 triệu trong tháng đầu!'
                author='Lê Văn C'
                role='Graphic Designer'
                avatarUrl='https://randomuser.me/api/portraits/men/67.jpg'
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='py-20 sm:py-28'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-500 to-emerald-500 p-8 sm:p-12'
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
              <div className='relative text-center'>
                <h2 className='text-xl font-semibold text-white sm:text-2xl'>
                  Bắt đầu kiếm tiền ngay hôm nay
                </h2>
                <p className='mt-3 text-white/80 max-w-md mx-auto'>
                  Đăng ký miễn phí và khám phá hàng trăm cơ hội việc làm
                </p>
                <div className='mt-6 flex flex-col sm:flex-row gap-3 justify-center'>
                  <Link
                    href='/auth/register'
                    className='inline-flex items-center justify-center gap-2 h-11 px-6 
                              text-[14px] font-medium text-accent-600 bg-white rounded-lg
                              shadow-lg hover:bg-white/90 transition-colors'
                  >
                    Đăng ký miễn phí
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                  <Link
                    href='/tasks'
                    className='inline-flex items-center justify-center gap-2 h-11 px-6
                              text-[14px] font-medium text-white/90 hover:text-white transition-colors'
                  >
                    Xem tasks trước
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className='border-t border-white/[0.04] bg-[#080c14]'>
          <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6'>
            <div className='grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5'>
              <div className='col-span-2'>
                <Logo size='sm' />
                <p className='mt-4 text-[13px] text-slate-500 max-w-xs'>
                  VEarn là nền tảng kết nối doanh nghiệp với freelancer thông
                  qua các task ngắn hạn.
                </p>
                <div className='mt-5 flex gap-2'>
                  <a href='' className='btn-icon h-8 w-8' aria-label='Facebook'>
                    <FaFacebookF className='h-4 w-4 shrink-0' aria-hidden />
                  </a>
                  <a href='' className='btn-icon h-8 w-8' aria-label='Twitter'>
                    <FaTwitter className='h-4 w-4 shrink-0' aria-hidden />
                  </a>
                  <a href='' className='btn-icon h-8 w-8' aria-label='LinkedIn'>
                    <FaLinkedinIn className='h-4 w-4 shrink-0' aria-hidden />
                  </a>
                </div>
              </div>

              <div>
                <h3 className='text-[13px] font-semibold text-white'>
                  Sản phẩm
                </h3>
                <ul className='mt-3 space-y-2'>
                  {[
                    { label: 'Tìm Task', href: '/tasks' },
                    { label: 'Đăng ký', href: '/auth/register' },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className='text-[13px] text-slate-500 hover:text-white transition-colors'
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-[13px] font-semibold text-white'>Hỗ trợ</h3>
                <ul className='mt-3 space-y-2'>
                  {['Hướng dẫn', 'FAQ', 'Liên hệ'].map((item) => (
                    <li key={item}>
                      <Link
                        href='#'
                        className='text-[13px] text-slate-500 hover:text-white transition-colors'
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-[13px] font-semibold text-white'>
                  Pháp lý
                </h3>
                <ul className='mt-3 space-y-2'>
                  {[
                    { label: 'Điều khoản', href: '/legal/terms' },
                    { label: 'Bảo mật', href: '/legal/privacy' },
                    { label: 'Cookies', href: '/legal/cookies' },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className='text-[13px] text-slate-500 hover:text-white transition-colors'
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3'>
              <p className='text-[12px] text-slate-600'>
                © {new Date().getFullYear()} VEarn. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Components

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className='nav-link'>
      {children}
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className='text-center lg:text-left'>
      <div className='text-lg sm:text-xl font-semibold text-white tracking-tight'>
        {value}
      </div>
      <div className='text-[12px] text-slate-500'>{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease }}
      className='glass-card p-5 group hover:border-white/[0.1] transition-colors'
    >
      <div
        className='mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg
                     bg-accent-500/10 text-accent-400 group-hover:bg-accent-500 
                     group-hover:text-white transition-colors'
      >
        {icon}
      </div>
      <h3 className='text-[15px] font-semibold text-white mb-1.5'>{title}</h3>
      <p className='text-[13px] text-slate-400'>{description}</p>
    </motion.div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
  delay,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease }}
      className='relative glass-card p-6 pt-10 overflow-visible'
    >
      <div className='absolute -top-4 left-5'>
        <div
          className='h-8 w-8 rounded-lg bg-gradient-to-br from-accent-400 to-emerald-500
                       flex items-center justify-center text-[12px] font-bold text-white
                       shadow-lg shadow-accent-500/30'
        >
          {step}
        </div>
      </div>
      <div className='mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400'>
        {icon}
      </div>
      <h3 className='text-[15px] font-semibold text-white mb-1.5'>{title}</h3>
      <p className='text-[13px] text-slate-400'>{description}</p>
    </motion.div>
  );
}

function TestimonialCard({
  content,
  author,
  role,
  avatarUrl,
  delay,
}: {
  content: string;
  author: string;
  role: string;
  avatarUrl: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease }}
      className='glass-card p-5'
    >
      <div className='flex gap-0.5 mb-3'>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
        ))}
      </div>
      <p className='text-[13px] text-slate-300 mb-4'>&ldquo;{content}&rdquo;</p>
      <div className='flex items-center gap-2.5'>
        <Image
          src={avatarUrl}
          alt={author}
          width={36}
          height={36}
          className='h-9 w-9 rounded-full object-cover'
        />
        <div>
          <div className='text-[13px] font-medium text-white'>{author}</div>
          <div className='text-[12px] text-slate-500'>{role}</div>
        </div>
      </div>
    </motion.div>
  );
}
