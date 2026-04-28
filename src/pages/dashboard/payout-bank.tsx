import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { buildVietQrImageUrl } from '@/lib/payment-gateways/vietqr-image-url';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  ExternalLink,
  Loader2,
  Search,
  Landmark,
} from 'lucide-react';

interface VietQrBankRow {
  readonly id: number;
  readonly name: string;
  readonly code: string;
  readonly bin: string;
  readonly shortName: string;
  readonly logo: string;
}

interface PayoutBankPayload {
  readonly payoutBankBin: string | null;
  readonly payoutBankCode: string | null;
  readonly payoutBankName: string | null;
  readonly payoutAccountNo: string | null;
  readonly payoutAccountName: string | null;
}

export default function PayoutBankPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBin, setSelectedBin] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [previewAmount, setPreviewAmount] = useState('500000');

  const { data: banks = [], isLoading: banksLoading } = useQuery({
    queryKey: ['vietqr-banks'],
    queryFn: () =>
      api.get('/payout/vietqr-banks').then((res) => res.data.data as VietQrBankRow[]),
    enabled: status === 'authenticated' && session?.user?.role === 'CONTRIBUTOR',
    staleTime: 1000 * 60 * 30,
  });

  const { data: saved, isLoading: savedLoading } = useQuery({
    queryKey: ['payout-bank'],
    queryFn: () => api.get('/user/payout-bank').then((res) => res.data.data as PayoutBankPayload),
    enabled: status === 'authenticated' && session?.user?.role === 'CONTRIBUTOR',
  });

  useEffect(() => {
    if (!saved) {
      return;
    }
    if (saved.payoutBankBin) {
      setSelectedBin(saved.payoutBankBin);
    }
    if (saved.payoutBankCode) {
      setBankCode(saved.payoutBankCode);
    }
    if (saved.payoutBankName) {
      setBankName(saved.payoutBankName);
    }
    if (saved.payoutAccountNo) {
      setAccountNo(saved.payoutAccountNo);
    }
    if (saved.payoutAccountName) {
      setAccountName(saved.payoutAccountName);
    }
  }, [saved]);

  const filteredBanks = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) {
      return banks;
    }
    return banks.filter(
      (b) =>
        b.shortName.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.bin.includes(q),
    );
  }, [banks, bankSearch]);

  const saveMutation = useMutation({
    mutationFn: (body: {
      payoutBankBin: string;
      payoutBankCode: string;
      payoutBankName: string;
      payoutAccountNo: string;
      payoutAccountName: string;
    }) => api.put('/user/payout-bank', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-bank'] });
      toast.success('Đã lưu thông tin nhận tiền');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || 'Không lưu được');
    },
  });

  const userId = session?.user?.id;
  const previewAmt = parseInt(previewAmount.replace(/\D/g, ''), 10) || 0;

  const qrUrl = useMemo(() => {
    if (
      !userId ||
      !selectedBin ||
      !accountNo.trim() ||
      !accountName.trim() ||
      previewAmt < 10_000
    ) {
      return null;
    }
    const addInfo = `VEARN${userId.replace(/-/g, '')}`;
    return buildVietQrImageUrl({
      bankId: selectedBin,
      accountNo: accountNo.trim(),
      amount: previewAmt,
      addInfo,
      accountName: accountName.trim(),
    });
  }, [userId, selectedBin, accountNo, accountName, previewAmt]);

  const onBankSelect = (bin: string): void => {
    setSelectedBin(bin);
    const row = banks.find((b) => b.bin === bin);
    if (row) {
      setBankCode(row.code);
      setBankName(row.name);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!selectedBin || !bankCode || !bankName) {
      toast.error('Chọn ngân hàng');
      return;
    }
    saveMutation.mutate({
      payoutBankBin: selectedBin,
      payoutBankCode: bankCode,
      payoutBankName: bankName,
      payoutAccountNo: accountNo.trim(),
      payoutAccountName: accountName.trim(),
    });
  };

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role !== 'CONTRIBUTOR') {
    return (
      <DashboardLayout>
        <Head>
          <title>TK nhận tiền - VEarn</title>
        </Head>
        <p className="text-slate-400">Trang này chỉ dành cho tài khoản Contributor.</p>
      </DashboardLayout>
    );
  }

  const loading = banksLoading || savedLoading;

  return (
    <DashboardLayout>
      <Head>
        <title>TK nhận tiền &amp; VietQR - VEarn</title>
      </Head>

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Landmark className="h-7 w-7 text-accent-400" />
            Tài khoản nhận tiền
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Khai báo STK để Admin chuyển khoản thủ công. Mã VietQR giúp Admin quét đúng số tài khoản
            và nội dung.{' '}
            <Link href="/dashboard/wallet" className="text-accent-400 hover:underline">
              Ví thu nhập
            </Link>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Thông tin ngân hàng</h2>

              <div>
                <label className="mb-1.5 block text-[13px] text-slate-300">Ngân hàng</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Tìm theo tên ngân hàng, mã…"
                    className="input-premium w-full pl-9"
                    autoComplete="off"
                  />
                </div>
                <Select value={selectedBin || undefined} onValueChange={onBankSelect}>
                  <SelectTrigger className="input-premium h-11 w-full border-white/[0.08] bg-white/[0.04] text-left text-slate-100">
                    <SelectValue placeholder="Chọn ngân hàng trong danh sách" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] border-white/10 bg-slate-900 text-slate-100">
                    {filteredBanks.length === 0 ? (
                      <p className="px-2 py-3 text-[13px] text-slate-500">Không có kết quả</p>
                    ) : (
                      filteredBanks.map((b) => (
                        <SelectItem
                          key={`${b.bin}-${b.id}`}
                          value={b.bin}
                          className="cursor-pointer focus:bg-white/10"
                        >
                          {b.shortName} — {b.name}{' '}
                          <span className="text-slate-500">({b.bin})</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] text-slate-300">Số tài khoản</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value.replace(/\s/g, ''))}
                  className="input-premium w-full font-mono"
                  placeholder="0123456789"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] text-slate-300">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="input-premium w-full"
                  placeholder="NGUYEN VAN A"
                  autoComplete="name"
                />
                <p className="mt-1 text-[12px] text-slate-500">
                  Nên viết không dấu, khớp đăng ký tại ngân hàng (hiển thị trên VietQR).
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] text-slate-300">
                  Số tiền mẫu trên QR (VND)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={previewAmount}
                  onChange={(e) => setPreviewAmount(e.target.value.replace(/[^\d]/g, ''))}
                  className="input-premium w-full"
                  placeholder="500000"
                />
                <p className="mt-1 text-[12px] text-slate-500">
                  Admin có thể chỉnh số tiền khi chuyển; đây chỉ là gợi ý trên mã QR.
                </p>
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                Lưu thông tin
              </button>
            </form>

            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Mã VietQR (xem trước)</h2>
              {!qrUrl ? (
                <p className="text-[13px] text-slate-500">
                  Chọn ngân hàng, điền đủ STK, chủ TK và số tiền mẫu ≥ 10.000đ để hiện QR.
                </p>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-[220px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white"
                  >
                    <Image
                      src={qrUrl}
                      alt="VietQR nhận tiền"
                      width={220}
                      height={264}
                      className="h-auto w-full"
                      unoptimized
                    />
                  </a>
                  <div className="min-w-0 space-y-2 text-[13px] text-slate-300">
                    <p>
                      <span className="text-slate-500">Nội dung CK (gợi ý): </span>
                      <code className="break-all text-amber-200/90">
                        VEARN{userId?.replace(/-/g, '')}
                      </code>
                    </p>
                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent-400 hover:underline"
                    >
                      Mở ảnh QR đầy đủ
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
