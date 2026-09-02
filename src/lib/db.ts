import { SEED_PROPERTIES, SEED_LEADS } from '@/lib/queries';
import { SEED_TRANSACTIONS } from '@/lib/transactions';
import { SEED_CHANNEL_PARTNERS, SEED_COMMISSIONS } from '@/lib/partners';
import { SEED_DEVELOPER_UNITS } from '@/lib/inventory';

export interface D1Database {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      all: <T = any>() => Promise<{ results: T[]; success: boolean }>;
      run: () => Promise<{ success: boolean; meta: any }>;
      first: <T = any>(colName?: string) => Promise<T | null>;
    };
  };
  batch: (statements: any[]) => Promise<any[]>;
  exec: (query: string) => Promise<{ count: number; duration: number }>;
}

export interface CloudflareEnv {
  DB?: D1Database;
  STORAGE?: any;
  AI?: any;
}

// In-memory local storage cache for development & disconnected mode
const localCache: Record<string, any[]> = {
  leads: SEED_LEADS,
  properties: SEED_PROPERTIES,
  site_visits: [],
  transactions: SEED_TRANSACTIONS,
  channel_partners: SEED_CHANNEL_PARTNERS,
  commissions: SEED_COMMISSIONS,
  inventory: SEED_DEVELOPER_UNITS,
  users: [
    {
      id: 'user-admin',
      email: 'admin@luxerealty.com',
      full_name: 'Admin User',
      role: 'SuperAdmin',
      phone: '+91 99999 88888',
      is_active: 1
    }
  ],
  settings: [],
  ad_spend: [],
  onboarding_profiles: []
};

/**
 * Execute SQL Query on Cloudflare D1 or fallback to local cache
 */
export async function queryD1<T = any>(
  sql: string,
  params: any[] = [],
  env?: CloudflareEnv
): Promise<{ results: T[]; success: boolean }> {
  try {
    if (env?.DB) {
      const stmt = env.DB.prepare(sql).bind(...params);
      const { results, success } = await stmt.all<T>();
      return { results: results || [], success };
    }
  } catch (err) {
    console.warn('D1 Database query error, using local fallback:', err);
  }

  // Fallback parsing for simple table selects when running locally
  const lower = sql.toLowerCase().trim();
  for (const table of Object.keys(localCache)) {
    if (lower.includes(`from ${table}`) || lower.includes(`into ${table}`)) {
      let items = (localCache[table] as any[]) || [];
      if (lower.includes('where id =') && params.length > 0) {
        items = items.filter((r: any) => r.id === params[0]);
      }
      return { results: (items as T[]) || [], success: true };
    }
  }

  return { results: [], success: true };
}

/**
 * Get single record by ID
 */
export async function getD1Record<T = any>(
  table: string,
  id: string,
  env?: CloudflareEnv
): Promise<T | null> {
  try {
    if (env?.DB) {
      const stmt = env.DB.prepare(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`).bind(id);
      const { results } = await stmt.all<T>();
      if (results && results.length > 0) return results[0];
    }
  } catch (err) {
    console.warn(`D1 query error for ${table} id ${id}:`, err);
  }

  const cached = localCache[table]?.find((r: any) => r.id === id);
  if (cached) return cached as T;

  if (table === 'properties') {
    const seedMatch = SEED_PROPERTIES.find((p) => p.id === id);
    if (seedMatch) return seedMatch as unknown as T;
  }

  return null;
}

/**
 * Insert or Update record
 */
export async function upsertD1Record(
  table: string,
  record: Record<string, any>,
  env?: CloudflareEnv
): Promise<boolean> {
  try {
    if (env?.DB) {
      const keys = Object.keys(record);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      await env.DB.prepare(sql).bind(...Object.values(record)).run();
      return true;
    }
  } catch (err) {
    console.warn(`Error writing to D1 table ${table}:`, err);
  }

  // Update local cache
  if (!localCache[table]) localCache[table] = [];
  const idx = localCache[table].findIndex((r: any) => r.id === record.id);
  if (idx >= 0) {
    localCache[table][idx] = { ...localCache[table][idx], ...record };
  } else {
    localCache[table].push(record);
  }
  return true;
}
