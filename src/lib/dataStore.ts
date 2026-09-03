// src/lib/dataStore.ts - Deep Unified Persistence Engine with Cloudflare D1 as Authoritative Backend
import { queryD1, upsertD1Record, deleteD1Record } from '@/lib/db';

export type EntityTable =
  | 'leads'
  | 'properties'
  | 'inventory'
  | 'transactions'
  | 'channel_partners'
  | 'commissions'
  | 'site_visits'
  | 'ad_spend'
  | 'onboarding_profiles'
  | 'users'
  | 'settings';

function getStorageKey(table: EntityTable): string {
  return `luxe-store-${table}`;
}

/**
 * Robust Deduplication & Merge Helper
 * Guarantees no duplicate records exist by ID or unique business key (title/name),
 * while ensuring default seed records are always preserved and merged.
 */
export function mergeAndDeduplicate<T = any>(
  primary: T[] = [],
  secondary: T[] = []
): T[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const result: T[] = [];

  const add = (item: any) => {
    if (!item || typeof item !== 'object') return;
    const id = item.id;
    const titleKey = (item.title || item.client_name || '').trim().toLowerCase();
    const unitKey = item.unit_number ? `${item.title || ''}-${item.unit_number}`.toLowerCase() : '';

    if (id && seenIds.has(id)) return;
    if (unitKey && seenKeys.has(unitKey)) return;
    if (titleKey && !item.unit_number && seenKeys.has(titleKey)) return;

    if (id) seenIds.add(id);
    if (unitKey) seenKeys.add(unitKey);
    else if (titleKey) seenKeys.add(titleKey);

    result.push(item as T);
  };

  // Primary authoritative items first
  if (Array.isArray(primary)) primary.forEach(add);
  // Merge secondary seeds if not already present
  if (Array.isArray(secondary)) secondary.forEach(add);

  return result;
}

/**
 * Load entity records from Cloudflare D1 as the authoritative primary source.
 * Automatically mirrors fetched records to local storage for offline resilience.
 */
export async function loadEntity<T = any>(
  table: EntityTable,
  defaultSeed: T[] = []
): Promise<T[]> {
  // 1. If on server side, query D1 directly and merge with seed
  if (typeof window === 'undefined') {
    try {
      const { results } = await queryD1(`SELECT * FROM ${table}`);
      if (results && results.length > 0) {
        return mergeAndDeduplicate(results as T[], defaultSeed);
      }
    } catch (err) {
      console.warn(`[DataStore Server] D1 query for ${table} failed:`, err);
    }
    return defaultSeed;
  }

  // 2. If on browser client side, try Cloudflare D1 Edge API as primary source
  let remoteRecords: T[] = [];
  try {
    const res = await fetch(`/api/entities/${table}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; records?: T[] };
      if (data && data.success && Array.isArray(data.records)) {
        remoteRecords = data.records;
      }
    }
  } catch (err) {
    console.warn(`[DataStore Client] D1 query for table ${table} deferred to cache:`, err);
  }

  // 3. Read local storage cache
  let localRecords: T[] = [];
  try {
    const localRaw = localStorage.getItem(getStorageKey(table));
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) localRecords = parsed;
    }
  } catch {
    // ignore
  }

  // Merge authoritative remote + local optimistic + default seed
  const combined = mergeAndDeduplicate(remoteRecords, mergeAndDeduplicate(localRecords, defaultSeed));

  // Sync back clean deduplicated list to localStorage
  try {
    localStorage.setItem(getStorageKey(table), JSON.stringify(combined));
  } catch {
    // ignore storage quota
  }

  return combined;
}

/**
 * Save a single entity record to Cloudflare D1 and sync local mirror
 */
export async function saveEntity<T extends { id?: string; title?: string }>(
  table: EntityTable,
  record: T
): Promise<{ success: boolean; mode: 'd1' | 'local' }> {
  const item: any = {
    ...record,
    id: record.id || `${table}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  };

  // 1. If on server side, write directly to D1
  if (typeof window === 'undefined') {
    try {
      await upsertD1Record(table, item);
      return { success: true, mode: 'd1' };
    } catch (err) {
      console.warn(`[DataStore Server] Failed to save record to ${table}:`, err);
      return { success: false, mode: 'local' };
    }
  }

  // 2. Optimistic Local Storage update in browser for 0ms UI latency
  try {
    const localRaw = localStorage.getItem(getStorageKey(table));
    const currentList: any[] = localRaw ? JSON.parse(localRaw) : [];
    
    // Replace if same ID or same title, otherwise prepend
    const existingIdx = currentList.findIndex((r: any) => 
      r.id === item.id || (item.title && r.title && r.title.trim().toLowerCase() === item.title.trim().toLowerCase())
    );

    if (existingIdx >= 0) {
      currentList[existingIdx] = { ...currentList[existingIdx], ...item };
    } else {
      currentList.unshift(item);
    }

    const deduplicated = mergeAndDeduplicate(currentList);
    localStorage.setItem(getStorageKey(table), JSON.stringify(deduplicated));
  } catch (e) {
    console.error(`[DataStore Client] Local cache update failed for ${table}:`, e);
  }

  // 3. Persist to Cloudflare D1 Database via Edge API
  try {
    const res = await fetch(`/api/entities/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record: item })
    });

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean };
      if (data && data.success) {
        return { success: true, mode: 'd1' };
      }
    }
  } catch (err) {
    console.warn(`[DataStore Client] D1 write for ${table} deferred, saved locally:`, err);
  }

  return { success: true, mode: 'local' };
}

/**
 * Save a batch of entity records to Cloudflare D1 and sync local mirror
 */
export async function saveEntityBatch<T extends { id?: string }>(
  table: EntityTable,
  records: T[]
): Promise<{ success: boolean; mode: 'd1' | 'local' }> {
  if (!records || records.length === 0) return { success: true, mode: 'local' };

  // 1. If on server side, write directly to D1
  if (typeof window === 'undefined') {
    try {
      for (const rec of records) {
        await upsertD1Record(table, rec);
      }
      return { success: true, mode: 'd1' };
    } catch (err) {
      console.warn(`[DataStore Server] Failed batch save to ${table}:`, err);
      return { success: false, mode: 'local' };
    }
  }

  // 2. Update local storage mirror in browser
  try {
    const localRaw = localStorage.getItem(getStorageKey(table));
    const currentList: any[] = localRaw ? JSON.parse(localRaw) : [];
    const merged = mergeAndDeduplicate(records, currentList);
    localStorage.setItem(getStorageKey(table), JSON.stringify(merged));
  } catch (e) {
    console.error(`[DataStore Client] Batch local update failed for ${table}:`, e);
  }

  // 3. Persist to Cloudflare D1 Database via Edge API
  try {
    const res = await fetch(`/api/entities/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean };
      if (data && data.success) {
        return { success: true, mode: 'd1' };
      }
    }
  } catch (err) {
    console.warn(`[DataStore Client] D1 batch write for ${table} deferred, saved locally:`, err);
  }

  return { success: true, mode: 'local' };
}

/**
 * Delete an entity record by ID
 */
export async function deleteEntity(
  table: EntityTable,
  id: string
): Promise<{ success: boolean }> {
  if (!id) return { success: false };

  // 1. If on server side, delete directly from D1
  if (typeof window === 'undefined') {
    try {
      await deleteD1Record(table, id);
      return { success: true };
    } catch (err) {
      console.warn(`[DataStore Server] Failed delete from ${table}:`, err);
      return { success: false };
    }
  }

  // 2. Update local storage mirror in browser
  try {
    const localRaw = localStorage.getItem(getStorageKey(table));
    if (localRaw) {
      const currentList: any[] = JSON.parse(localRaw);
      const filtered = currentList.filter((r: any) => r.id !== id);
      localStorage.setItem(getStorageKey(table), JSON.stringify(filtered));
    }
  } catch (e) {
    console.error(`[DataStore Client] Delete from local cache failed for ${table}:`, e);
  }

  // 3. Delete from Cloudflare D1 via Edge API
  try {
    const res = await fetch(`/api/entities/${table}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      return { success: true };
    }
  } catch (err) {
    console.warn(`[DataStore Client] D1 delete for ${table} deferred:`, err);
  }

  return { success: true };
}
