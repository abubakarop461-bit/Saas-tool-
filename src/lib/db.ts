import { SEED_PROPERTIES } from '@/lib/queries';

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
  leads: [
    {
      id: 'lead-1',
      client_name: 'Rahul Sharma',
      phone: '+91 98230 11223',
      email: 'rahul.sharma@example.com',
      budget_min: 15000000,
      budget_max: 25000000,
      preferred_location: 'Kalyani Nagar',
      property_type: 'Apartment',
      configuration: '3 BHK',
      category: 'Residential',
      transaction_type: 'Outright',
      status: 'Hot',
      assigned_to: 'Admin User',
      created_at: new Date().toISOString()
    },
    {
      id: 'lead-2',
      client_name: 'Ananya Deshmukh',
      phone: '+91 97654 32100',
      email: 'ananya.d@example.com',
      budget_min: 30000000,
      budget_max: 45000000,
      preferred_location: 'Koregaon Park',
      property_type: 'Penthouse',
      configuration: '4 BHK',
      category: 'Residential',
      transaction_type: 'Outright',
      status: 'Warm',
      assigned_to: 'Admin User',
      created_at: new Date().toISOString()
    }
  ],
  properties: SEED_PROPERTIES,
  site_visits: [],
  transactions: [],
  channel_partners: [],
  commissions: [],
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
  settings: []
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
