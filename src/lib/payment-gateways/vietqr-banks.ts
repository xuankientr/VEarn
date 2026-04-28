/**
 * Danh sách ngân hàng VietQR (cache ngắn trong tiến trình API).
 */

export interface VietQrBankListItem {
  readonly id: number;
  readonly name: string;
  readonly code: string;
  readonly bin: string;
  readonly shortName: string;
  readonly logo: string;
}

interface CacheEntry {
  readonly at: number;
  readonly data: readonly VietQrBankListItem[];
}

const TTL_MS = 60 * 60 * 1000;
let cache: CacheEntry | null = null;

const parseList = (raw: unknown): readonly VietQrBankListItem[] => {
  if (!raw || typeof raw !== 'object' || !('data' in raw)) {
    return [];
  }
  const data = (raw as { data: unknown }).data;
  if (!Array.isArray(data)) {
    return [];
  }
  return data
    .filter(
      (row): row is Record<string, unknown> =>
        row !== null && typeof row === 'object' && (row as { isTransfer?: number }).isTransfer === 1,
    )
    .map((row) => ({
      id: Number(row.id),
      name: String(row.name ?? ''),
      code: String(row.code ?? ''),
      bin: String(row.bin ?? ''),
      shortName: String(row.shortName ?? row.short_name ?? ''),
      logo: String(row.logo ?? ''),
    }))
    .filter((b) => b.bin.length >= 5);
};

/**
 * Lấy danh sách NH hỗ trợ chuyển (Napas), có cache 1 giờ.
 */
export const getVietQrBanksCached = async (): Promise<readonly VietQrBankListItem[]> => {
  if (cache !== null && Date.now() - cache.at < TTL_MS) {
    return cache.data;
  }
  const res = await fetch('https://api.vietqr.io/v2/banks');
  if (!res.ok) {
    throw new Error(`VietQR banks HTTP ${res.status}`);
  }
  const json: unknown = await res.json();
  const data = parseList(json);
  cache = { at: Date.now(), data };
  return data;
};
