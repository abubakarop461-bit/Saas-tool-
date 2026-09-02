// src/lib/adSpend.ts - Cloudflare D1 Ad Spend Management & Local Sync
import { upsertD1Record, queryD1 } from '@/lib/db';

export interface AdSpendRecord {
  id: string;
  company_id: string;
  lead_source_id: string;
  campaign_name?: string;
  property_id?: string;
  platform?: string;
  spend_amount: number;
  period_start?: string;
  period_end?: string;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_SEED_AD_SPEND: Record<string, number> = {
  'Instagram Campaign': 85000,
  'Google Search Ads': 120000,
  '99acres': 65000,
  'Housing.com': 45000,
  'MagicBricks Luxury': 95000,
  'Channel Partner (ABC Realty)': 50000,
  'Channel Partner (Knight Frank)': 75000,
  'Channel Partner': 30000,
  'Direct Referral': 0,
  'Referral': 0,
  'VIP Direct': 0,
  'Walk-in': 0
};

export async function fetchAdSpendMap(companyId: string = 'default_company'): Promise<Record<string, number>> {
  const result: Record<string, number> = { ...INITIAL_SEED_AD_SPEND };

  // 1. D1 API is authoritative source - try server API first
  try {
    const res = await fetch(`/api/ad-spend`);
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; records?: AdSpendRecord[] };
      if (data && data.success && Array.isArray(data.records)) {
        data.records.forEach((r: AdSpendRecord) => {
          if (r.lead_source_id) {
            result[r.lead_source_id] = Number(r.spend_amount) || 0;
          }
        });

        // Sync fresh D1 data into localStorage for offline availability
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`luxe-ad-spend-${companyId}`, JSON.stringify(result));
          } catch {
            // cache ignore
          }
        }

        return result;
      }
    }
  } catch (err) {
    console.warn('Network/server unavailable, falling back to local ad spend store:', err);
  }

  // 2. Fallback to localStorage if network or server API is unavailable
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`luxe-ad-spend-${companyId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          return { ...result, ...parsed };
        }
      } catch {
        // use default seed
      }
    }
  }

  return result;
}

export async function saveAdSpendRecord(
  leadSourceId: string,
  spendAmount: number,
  companyId: string = 'default_company'
): Promise<{ success: boolean; mode: 'd1' | 'local' }> {
  const amount = Math.max(0, Number(spendAmount) || 0);

  // Always update local storage
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`luxe-ad-spend-${companyId}`);
      const current = local ? JSON.parse(local) : { ...INITIAL_SEED_AD_SPEND };
      current[leadSourceId] = amount;
      localStorage.setItem(`luxe-ad-spend-${companyId}`, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to write ad spend to localStorage:', e);
    }
  }

  // Persist to D1 via server API
  try {
    const payload: Partial<AdSpendRecord> = {
      lead_source_id: leadSourceId,
      spend_amount: amount
    };

    const res = await fetch('/api/ad-spend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean };
      if (data && data.success) {
        return { success: true, mode: 'd1' };
      }
    }
    console.warn('Server API rejected ad spend save, kept local copy:', res.statusText);
  } catch (err) {
    console.warn('Network error saving ad spend to D1 server API; kept local copy:', err);
  }

  return { success: true, mode: 'local' };
}
