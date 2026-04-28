import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  Wallet as WalletIcon,
  Loader2,
  AlertCircle,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface BankTransferInstructions {
  readonly bankName: string;
  readonly accountNo: string;
  readonly accountName: string;
  readonly amount: number;
  readonly transferContent: string;
  readonly note: string;
  readonly vietQrImageUrl?: string;
}

interface WalletPayload {
  walletKind: 'business' | 'contributor';
  balance: number;
  sandboxWithdraw: boolean;
  topUps: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    bankTransferNote?: string;
    failureReason?: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    note?: string | null;
    createdAt: string;
    completedAt?: string | null;
  }>;
  gateways: {
    bankTransfer: boolean;
  };
}

const METHOD_LABEL: Record<string, string> = {
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  STRIPE: 'Stripe',
  BANK_TRANSFER: 'Chuyển khoản',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  AWAITING_CONFIRMATION: 'Chờ xác nhận CK',
  COMPLETED: 'Thành công',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

const WITHDRAW_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  COMPLETED: 'Hoàn tất',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

export default function WalletPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('500000');
  const [withdrawAmount, setWithdrawAmount] = useState('100000');
  const [bankInfo, setBankInfo] = useState<BankTransferInstructions | null>(null);

  const walletEnabled =
    !!session?.user && ['BUSINESS', 'CONTRIBUTOR'].includes(session.user.role);

  const { data, isLoading } = useQuery({
    queryKey: ['wallet', session?.user?.role],
    queryFn: () => api.get('/payments/wallet').then((res) => res.data.data as WalletPayload),
    enabled: walletEnabled,
  });

  const topUpMutation = useMutation({
    mutationFn: (payload: { amount: number; method: 'BANK_TRANSFER' }) =>
      api.post('/payments/wallet/topup', payload),
    onSuccess: (res) => {
      const d = res.data.data;
      if (d.method === 'BANK_TRANSFER' && d.instructions) {
        setBankInfo(d.instructions as BankTransferInstructions);
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        toast.success('Đã tạo yêu cầu chuyển khoản');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Không tạo được giao dịch');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (payload: { amount: number }) =>
      api.post('/payments/wallet/withdraw-sandbox', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Đã rút (sandbox — không chuyển khoản thật)');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || 'Không thực hiện được rút ví');
    },
  });

  useEffect(() => {
    const t = router.query.topup;
    if (t === 'success') {
      toast.success('Nạp ví thành công!');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      router.replace('/dashboard/wallet', undefined, { shallow: true });
    } else if (t === 'error') {
      toast.error('Nạp ví thất bại hoặc bị hủy');
      router.replace('/dashboard/wallet', undefined, { shallow: true });
    } else if (t === 'pending') {
      toast.message('Đang xử lý', { description: 'Tải lại trang sau vài giây.' });
      router.replace('/dashboard/wallet', undefined, { shallow: true });
    }
  }, [router.query.topup, queryClient, router]);

  if (session?.user?.role === 'ADMIN') {
    return (
      <DashboardLayout>
        <Head>
          <title>Ví - VEarn</title>
        </Head>
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
          <AlertCircle className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-white">Admin không dùng ví Business</h2>
          <p className="mb-4 max-w-md text-center text-slate-400">
            Xác nhận nạp ví người dùng tại trang quản trị.
          </p>
          <Link href="/dashboard/admin/wallet-topups" className="text-accent-400 hover:text-accent-300">
            → Xác nhận nạp ví
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';
  const amt = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const withdrawAmt = parseInt(withdrawAmount.replace(/\D/g, ''), 10) || 0;
  const isContributor = session?.user?.role === 'CONTRIBUTOR';
  const pageTitle = isContributor ? 'Ví thu nhập - VEarn' : 'Ví & Nạp tiền - VEarn';

  const withdrawalsBlock = (items: WalletPayload['withdrawals']) => (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="font-semibold text-white">Lịch sử rút tiền</h2>
      </div>
      <div className="divide-y divide-white/[0.06] max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-6 text-[13px] text-slate-500 text-center">Chưa có lần rút</p>
        ) : (
          items.map((w) => (
            <div
              key={w.id}
              className="px-5 py-3 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="text-[14px] font-medium text-white">−{formatMoney(w.amount)}</p>
                <p className="text-[12px] text-slate-500">
                  {new Date(w.createdAt).toLocaleString('vi-VN')}
                  {w.note ? ` · ${w.note}` : ''}
                </p>
              </div>
              <span className="badge-accent text-[11px]">
                {WITHDRAW_STATUS_LABEL[w.status] || w.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const sandboxWithdrawCard = (
    <div className="glass-card rounded-xl p-6 space-y-4 border border-amber-500/20">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-white">Rút tiền (sandbox)</h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Chỉ bật khi <code className="text-slate-300">PAYMENT_SANDBOX=true</code>. Trừ số dư ví
            trên hệ thống, không chuyển khoản thật.
          </p>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] text-slate-300">Số tiền rút (VND)</label>
        <input
          type="text"
          inputMode="numeric"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^\d]/g, ''))}
          className="input-premium w-full"
          placeholder="100000"
        />
      </div>
      <button
        type="button"
        disabled={withdrawMutation.isPending || withdrawAmt < 10_000 || withdrawAmt > (data?.balance ?? 0)}
        onClick={() => withdrawMutation.mutate({ amount: withdrawAmt })}
        className="btn-secondary"
      >
        {withdrawMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
        ) : null}
        Xác nhận rút (sandbox)
      </button>
      {withdrawAmt > 0 && withdrawAmt < 10_000 && (
        <p className="text-[12px] text-rose-400">Tối thiểu 10.000đ</p>
      )}
      {withdrawAmt > (data?.balance ?? 0) && withdrawAmt >= 10_000 && (
        <p className="text-[12px] text-rose-400">Vượt số dư khả dụng</p>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <WalletIcon className="h-7 w-7 text-accent-400" />
            {isContributor ? 'Ví thu nhập' : 'Ví doanh nghiệp'}
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            {isContributor ? (
              <>
                Số dư tích lũy khi Business/Admin đã thanh toán cho bạn (ví nền tảng).{' '}
                <Link href="/dashboard/earnings" className="text-accent-400 hover:underline">
                  Xem thu nhập theo task
                </Link>
                .
              </>
            ) : (
              <>
                Nạp bằng chuyển khoản ngân hàng (mã VietQR nếu cấu hình BIN). Admin xác nhận sau
                khi nhận tiền. Dùng số dư để trả contributor.
              </>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : isContributor ? (
          <>
            <div className="glass-card rounded-xl p-6">
              <p className="text-[13px] text-slate-400 mb-1">Số dư khả dụng</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-400 sm:text-[1.65rem]">
                {formatMoney(data?.balance ?? 0)}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 border border-white/[0.06]">
              <p className="text-[13px] text-slate-400">
                Khi Admin chi trả thủ công: khai báo STK +{' '}
                <Link href="/dashboard/payout-bank" className="text-accent-400 hover:underline">
                  tạo mã VietQR nhận tiền
                </Link>
                .
              </p>
            </div>
            {data?.sandboxWithdraw ? sandboxWithdrawCard : (
              <div className="glass-card rounded-xl p-6 border border-white/[0.06]">
                <p className="text-[13px] text-slate-400">
                  Rút tiền thật sẽ được bật sau (chuyển khoản / ví). Hiện chỉ có mô phỏng rút khi
                  sandbox được bật trên môi trường dev.
                </p>
              </div>
            )}
            {withdrawalsBlock(data?.withdrawals ?? [])}
          </>
        ) : (
          <>
            <div className="glass-card rounded-xl p-6">
              <p className="text-[13px] text-slate-400 mb-1">Số dư khả dụng</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-400 sm:text-[1.65rem]">
                {formatMoney(data?.balance ?? 0)}
              </p>
            </div>

            {data?.sandboxWithdraw ? sandboxWithdrawCard : null}

            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Nạp tiền</h2>
              <div>
                <label className="mb-1.5 block text-[13px] text-slate-300">Số tiền (VND)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  className="input-premium w-full"
                  placeholder="500000"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {data?.gateways.bankTransfer && (
                  <button
                    type="button"
                    disabled={topUpMutation.isPending || amt < 10_000}
                    onClick={() => topUpMutation.mutate({ amount: amt, method: 'BANK_TRANSFER' })}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Chuyển khoản &amp; VietQR
                  </button>
                )}
              </div>
              {!data?.gateways.bankTransfer && (
                <p className="text-[13px] text-amber-400/90">
                  Chưa cấu hình nạp ví. Thêm vào <code className="text-slate-300">.env</code>:{' '}
                  <code className="text-slate-300">BANK_TRANSFER_BANK_NAME</code>,{' '}
                  <code className="text-slate-300">BANK_TRANSFER_ACCOUNT_NO</code>,{' '}
                  <code className="text-slate-300">BANK_TRANSFER_ACCOUNT_NAME</code>
                  (và tuỳ chọn <code className="text-slate-300">BANK_TRANSFER_VIETQR_BIN</code> cho
                  mã QR). Với Docker: khai báo rồi <code className="text-slate-300">docker compose up -d</code>.
                </p>
              )}
              {amt > 0 && amt < 10_000 && (
                <p className="text-[12px] text-rose-400">Tối thiểu 10.000đ</p>
              )}
            </div>

            {bankInfo && (
              <div className="glass-card rounded-xl p-6 border border-accent-500/20 space-y-4">
                <h3 className="font-semibold text-white">Hướng dẫn chuyển khoản</h3>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  {bankInfo.vietQrImageUrl ? (
                    <div className="shrink-0 space-y-2">
                      <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wide">
                        Quét mã VietQR
                      </p>
                      <a
                        href={bankInfo.vietQrImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block w-[200px] overflow-hidden rounded-lg border border-white/10 bg-white"
                      >
                        <Image
                          src={bankInfo.vietQrImageUrl}
                          alt="Mã QR chuyển khoản VietQR"
                          width={200}
                          height={240}
                          className="h-auto w-full"
                          unoptimized
                        />
                      </a>
                      <a
                        href={bankInfo.vietQrImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-accent-400 hover:underline"
                      >
                        Mở ảnh QR
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-2 text-[13px] text-slate-300 bg-white/[0.03] p-4 rounded-lg">
                    <p>
                      <span className="text-slate-500">Ngân hàng: </span>
                      {bankInfo.bankName}
                    </p>
                    <p>
                      <span className="text-slate-500">Số tài khoản: </span>
                      <span className="font-mono text-white">{bankInfo.accountNo}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Chủ TK: </span>
                      {bankInfo.accountName}
                    </p>
                    <p>
                      <span className="text-slate-500">Số tiền: </span>
                      <span className="font-medium text-emerald-300">
                        {new Intl.NumberFormat('vi-VN').format(bankInfo.amount)} đ
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Nội dung CK (bắt buộc): </span>
                      <span className="font-mono text-amber-200/95 break-all">
                        {bankInfo.transferContent}
                      </span>
                    </p>
                    <p className="text-slate-500 text-[12px] pt-1">{bankInfo.note}</p>
                    {!bankInfo.vietQrImageUrl ? (
                      <p className="text-[12px] text-slate-500 pt-1">
                        Thêm <code className="text-slate-400">BANK_TRANSFER_VIETQR_BIN</code> vào{' '}
                        <code className="text-slate-400">.env</code> (mã BIN 6 số Napas) để hiện mã
                        QR.
                      </p>
                    ) : null}
                  </div>
                </div>
                <button type="button" onClick={() => setBankInfo(null)} className="btn-ghost">
                  Đóng
                </button>
              </div>
            )}

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="font-semibold text-white">Lịch sử nạp tiền</h2>
              </div>
              <div className="divide-y divide-white/[0.06] max-h-[400px] overflow-y-auto">
                {(data?.topUps ?? []).length === 0 ? (
                  <p className="p-6 text-[13px] text-slate-500 text-center">Chưa có giao dịch</p>
                ) : (
                  data!.topUps.map((t) => (
                    <div key={t.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[14px] font-medium text-white">
                          +{formatMoney(t.amount)}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {METHOD_LABEL[t.method] || t.method} ·{' '}
                          {new Date(t.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className="badge-accent text-[11px]">
                        {STATUS_LABEL[t.status] || t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {withdrawalsBlock(data?.withdrawals ?? [])}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
