import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { EmptyTasksIllustration } from '@/components/illustrations';
import {
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  AlertCircle,
  User,
  FileText,
  Filter,
} from 'lucide-react';

export default function PaymentsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentNote, setPaymentNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', statusFilter],
    queryFn: () =>
      api
        .get('/payments', { params: { status: statusFilter || undefined } })
        .then((res) => res.data),
    enabled: session?.user?.role === 'BUSINESS',
  });

  const { data: walletRes } = useQuery({
    queryKey: ['wallet-overview'],
    queryFn: () => api.get('/payments/wallet').then((r) => r.data),
    enabled: session?.user?.role === 'BUSINESS',
  });

  const walletBalance = walletRes?.data?.balance ?? 0;

  const payMutation = useMutation({
    mutationFn: ({
      paymentId,
      source,
    }: {
      paymentId: string;
      source: 'MANUAL' | 'WALLET';
    }) =>
      api.post(`/payments/${paymentId}/pay`, { note: paymentNote, source }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.source === 'WALLET'
          ? 'Đã thanh toán từ ví!'
          : 'Đã thanh toán thành công!'
      );
      setSelectedPayment(null);
      setPaymentNote('');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-overview'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Có lỗi xảy ra';
      toast.error(msg);
    },
  });

  const isBusiness = session?.user?.role === 'BUSINESS';

  if (session?.user?.role === 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">
            Không có quyền truy cập
          </h2>
          <p className="mb-4 text-slate-400">
            Vui lòng xem thu nhập tại trang Earnings
          </p>
          <Link
            href="/dashboard/earnings"
            className="text-accent-400 hover:text-accent-300"
          >
            → Đi đến trang Thu nhập
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role === 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">Không có quyền truy cập</h2>
          <p className="mb-4 max-w-md text-center text-slate-400">
            Admin không xem lịch sử chi trả chi tiết của doanh nghiệp. Xác nhận nạp ví tại mục Quản trị
            nếu cần.
          </p>
          <Link href="/dashboard/admin/wallet-topups" className="text-accent-400 hover:text-accent-300">
            → Xác nhận nạp ví
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const payments = data?.data || [];
  const filteredPayments = payments.filter(
    (p: any) =>
      p.contributor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.submission?.task?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum: number, p: any) => sum + p.amount, 0),
    paid: payments.filter((p: any) => p.status === 'PAID').length,
    paidAmount: payments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => sum + p.amount, 0),
    unpaid: payments.filter((p: any) => p.status === 'UNPAID').length,
    unpaidAmount: payments
      .filter((p: any) => p.status === 'UNPAID')
      .reduce((sum: number, p: any) => sum + p.amount, 0),
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount) + ' đ';

  return (
    <DashboardLayout>
      <Head>
        <title>Quản lý Thanh toán - VEarn</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Quản lý Thanh toán</h1>
            <p className="mt-1 text-slate-400">
              Theo dõi và xử lý thanh toán cho cộng tác viên
            </p>
          </div>
          {isBusiness && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs text-slate-400">Số dư ví (nạp VNPay/MoMo/CK)</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {formatMoney(walletBalance)}
                </p>
              </div>
              <Link
                href="/dashboard/wallet"
                className="rounded-lg border border-accent-500/40 bg-accent-500/10 px-3 py-2 text-sm font-medium text-accent-300 transition hover:bg-accent-500/20"
              >
                Nạp ví
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/5 p-2">
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Tổng giao dịch</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-500/10 p-2">
                <DollarSign className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-accent-400">
                  {formatMoney(stats.totalAmount)}
                </p>
                <p className="text-xs text-slate-400">Tổng giá trị</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">
                  {formatMoney(stats.paidAmount)}
                </p>
                <p className="text-xs text-slate-400">{stats.paid} đã thanh toán</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">
                  {formatMoney(stats.unpaidAmount)}
                </p>
                <p className="text-xs text-slate-400">{stats.unpaid} chờ thanh toán</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên contributor hoặc task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium w-full pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-premium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="UNPAID">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
          </select>
        </div>

        {/* Payments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
            <EmptyTasksIllustration className="mb-6 h-40 w-40" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {searchQuery ? 'Không tìm thấy' : 'Chưa có thanh toán nào'}
            </h3>
            <p className="text-slate-400">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Khi submissions được duyệt, thanh toán sẽ hiển thị tại đây'}
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Contributor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Task
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {payment.contributor?.avatar ? (
                            <Image
                              src={payment.contributor.avatar}
                              alt={payment.contributor.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-600 text-sm font-medium text-white">
                              {payment.contributor?.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {payment.contributor?.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {payment.contributor?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/tasks/${payment.submission?.task?.slug}`}
                          className="font-medium text-white hover:text-accent-400"
                        >
                          {payment.submission?.task?.title?.slice(0, 40)}
                          {payment.submission?.task?.title?.length > 40 && '...'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-400">
                          {formatMoney(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === 'PAID' ? (
                          <span className="badge-emerald inline-flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="badge-amber inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Chờ thanh toán
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'UNPAID' ? (
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                          >
                            Thanh toán
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">
                            {payment.paidAt &&
                              new Date(payment.paidAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Xác nhận thanh toán
            </h2>

            <div className="mb-4 rounded-lg bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-slate-400">Contributor:</span>
                <span className="font-medium text-white">
                  {selectedPayment.contributor?.name}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-slate-400">Task:</span>
                <span className="font-medium text-white">
                  {selectedPayment.submission?.task?.title?.slice(0, 30)}...
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-slate-400">Số tiền:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatMoney(selectedPayment.amount)}
                </span>
              </div>
              {isBusiness && (
                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
                  <span className="text-slate-400">Số dư ví:</span>
                  <span
                    className={
                      walletBalance >= selectedPayment.amount
                        ? 'font-medium text-white'
                        : 'font-medium text-amber-400'
                    }
                  >
                    {formatMoney(walletBalance)}
                  </span>
                </div>
              )}
            </div>

            {isBusiness && walletBalance < selectedPayment.amount && (
              <p className="mb-3 text-sm text-amber-400/90">
                Số dư ví không đủ.{' '}
                <Link
                  href="/dashboard/wallet"
                  className="underline hover:text-amber-300"
                >
                  Nạp thêm tại trang Ví
                </Link>
                .
              </p>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Ghi chú (tuỳ chọn)
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                rows={2}
                className="input-premium w-full"
                placeholder="VD: Đã chuyển khoản qua Momo"
              />
            </div>

            <div className="flex flex-col gap-2">
              {isBusiness && (
                <button
                  type="button"
                  onClick={() =>
                    payMutation.mutate({
                      paymentId: selectedPayment.id,
                      source: 'WALLET',
                    })
                  }
                  disabled={
                    payMutation.isPending || walletBalance < selectedPayment.amount
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 py-2.5 font-medium text-white transition hover:bg-accent-700 disabled:opacity-50"
                >
                  {payMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Thanh toán từ ví
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  payMutation.mutate({
                    paymentId: selectedPayment.id,
                    source: 'MANUAL',
                  })
                }
                disabled={payMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {payMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Đánh dấu đã thanh toán (thủ công)
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedPayment(null);
                setPaymentNote('');
              }}
              className="mt-3 w-full rounded-lg border border-white/10 py-2.5 font-medium text-slate-300 transition hover:bg-white/5"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
