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

  // 1. Try local storage first if in browser
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`luxe-ad-spend-${companyId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          return { ...result, ...parsed };
        }
      } catch {
        // use fallback
      }
    }
  }

  // 2. Try fetching from backend API route
  try {
    const res = await fetch(`/api/ad-spend?company_id=${encodeURIComponent(companyId)}`);
    if (res.ok) {
      const data: any = await res.json();
      if (data && Array.isArray(data.records)) {
        data.records.forEach((r: AdSpendRecord) => {
          if (r.lead_source_id) {
            result[r.lead_source_id] = Number(r.spend_amount) || 0;
          }
        });
      }
    }
  } catch (err) {
    console.warn('Unable to fetch D1 ad spend from server API, using local fallback:', err);
  }

  return result;
}

export async function saveAdSpendRecord(
  leadSourceId: string,
  spendAmount: number,
  companyId: string = 'default_company'
): Promise<boolean> {
  const amount = Math.max(0, Number(spendAmount) || 0);

  // 1. Always update localStorage
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

  // 2. Persist to API route / D1 database
  try {
    const payload: AdSpendRecord = {
      id: `spend-${companyId}-${leadSourceId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      company_id: companyId,
      lead_source_id: leadSourceId,
      spend_amount: amount,
      updated_at: new Date().toISOString()
    };

    await fetch('/api/ad-spend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Saved ad spend locally; server sync failed:', err);
  }

  return true;
}
