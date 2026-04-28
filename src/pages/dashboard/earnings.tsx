import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments?limit=50').then((res) => res.data),
  });

  const payments = data?.data || [];
  const stats = data?.stats || { totalAmount: 0, totalPaid: 0, totalUnpaid: 0 };

  return (
    <DashboardLayout>
      <Head>
        <title>Thu nhập - VEarn</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="page-title">Thu nhập của tôi</h1>
          <p className="mt-2 text-[13px] text-slate-400">
            Tiền đã thanh toán được ghi vào{' '}
            <Link href="/dashboard/wallet" className="text-accent-400 hover:underline">
              ví thu nhập
            </Link>{' '}
            (rút khi bật sandbox).
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Tổng thu nhập"
            value={formatMoney(stats.totalAmount)}
            color="accent"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Đã thanh toán"
            value={formatMoney(stats.totalPaid)}
            color="emerald"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Chờ thanh toán"
            value={formatMoney(stats.totalUnpaid)}
            color="amber"
          />
        </div>

        {/* Payment history */}
        <div className="glass-card rounded-xl">
          <div className="border-b border-white/5 p-4">
            <h2 className="font-semibold text-white">Lịch sử thanh toán</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400">Chưa có thanh toán nào</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {payment.submission?.task?.title || 'Task'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                      {payment.paidAt && (
                        <span className="ml-2 text-emerald-400">
                          • Đã thanh toán{' '}
                          {new Date(payment.paidAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    <PaymentStatus status={payment.status} />
                    <span className="font-semibold text-emerald-400">
                      {formatMoney(payment.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'accent' | 'emerald' | 'amber';
}) {
  const colors = {
    accent: 'bg-accent-500/10 text-accent-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function PaymentStatus({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        status === 'PAID'
          ? 'badge-emerald'
          : 'badge-amber'
      }`}
    >
      {status === 'PAID' ? 'Đã trả' : 'Chưa trả'}
    </span>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
