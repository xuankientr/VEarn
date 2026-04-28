/**
 * 404 Page - Premium Dark Theme
 */

import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Logo } from '@/components/Logo';
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 - Không tìm thấy trang - VEarn</title>
      </Head>

      <div className="flex min-h-screen flex-col bg-[#0a0f1a]">
        {/* Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/20 blur-[120px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Logo size="lg" />
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 flex flex-1 items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* 404 Display */}
            <div className="relative mx-auto mb-8 w-64 h-64">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-500/30 to-violet-500/30 blur-3xl animate-pulse-slow" />
              
              {/* Number */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.2 }}
                className="relative flex h-full w-full items-center justify-center"
              >
                <div className="glass-card rounded-full w-48 h-48 flex items-center justify-center">
                  <span className="text-7xl font-bold text-gradient">404</span>
                </div>
              </motion.div>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Oops! Trang không tồn tại
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mb-8 max-w-md text-slate-400"
            >
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
              không khả dụng.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/" className="btn-primary">
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Link>
              <Link href="/tasks" className="btn-secondary">
                <Search className="h-5 w-5" />
                <span>Tìm Tasks</span>
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => window.history.back()}
              className="mt-8 inline-flex items-center gap-2 text-slate-500 hover:text-accent-400 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang trước
            </motion.button>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-navy-950/50 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} VEarn. All rights reserved.
        </footer>
      </div>
    </>
  );
}
