import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Landmark,
} from 'lucide-react';

interface WalletTopUpRow {
  readonly id: string;
  readonly amount: number;
  readonly method: string;
  readonly status: string;
  readonly gatewayOrderRef: string | null;
  readonly createdAt: string;
  readonly user: { readonly id: string; readonly name: string | null; readonly email: string | null };
}

export default function AdminWalletTopUpsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-wallet-topups'],
    queryFn: () =>
      api
        .get('/admin/wallet-topups', { params: { status: 'AWAITING_CONFIRMATION' } })
        .then((res) => res.data),
    enabled: session?.user?.role === 'ADMIN',
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/wallet-topups/${id}/confirm`),
    onSuccess: () => {
      toast.success('Đã cộng ví cho user');
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-topups'] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  if (session?.user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">Chỉ dành cho Admin</h2>
          <Link href="/dashboard" className="text-accent-400 hover:text-accent-300">
            ← Về Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const items: WalletTopUpRow[] = data?.data ?? [];

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount) + ' đ';

  return (
    <DashboardLayout>
      <Head>
        <title>Xác nhận nạp ví - Admin - VEarn</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="page-title">Xác nhận nạp ví (chuyển khoản)</h1>
          <p className="mt-1 text-slate-400">
            Sau khi kiểm tra đã nhận tiền trên tài khoản ngân hàng, bấm xác nhận để cộng số dư ví
            Business.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-xl py-16">
            <Landmark className="mb-4 h-14 w-14 text-slate-500" />
            <p className="text-slate-400">Không có yêu cầu nạp ví chờ xác nhận</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                      Mã CK
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{row.user.name ?? '—'}</p>
                        <p className="text-sm text-slate-400">{row.user.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        {formatMoney(row.amount)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-300">
                        {row.gatewayOrderRef ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {new Date(row.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => confirmMutation.mutate(row.id)}
                          disabled={confirmMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {confirmMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Đã nhận tiền
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
