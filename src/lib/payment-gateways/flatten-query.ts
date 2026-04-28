import type { NextApiRequest } from 'next';

export const flattenQuery = (
  q: NextApiRequest['query'] | Record<string, string | string[] | undefined | unknown>
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null) continue;
    out[k] = Array.isArray(v) ? String(v[0]) : String(v);
  }
  return out;
};
