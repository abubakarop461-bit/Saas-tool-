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
 * Load entity records from Cloudflare D1 as the authoritative primary source.
 * Automatically mirrors fetched records to local storage for offline resilience.
 */
export async function loadEntity<T = any>(
  table: EntityTable,
  defaultSeed: T[] = []
): Promise<T[]> {
  // 1. If on server side, query D1 directly
  if (typeof window === 'undefined') {
    try {
      const { results } = await queryD1(`SELECT * FROM ${table}`);
      if (results && results.length > 0) return results as T[];
    } catch (err) {
      console.warn(`[DataStore Server] D1 query for ${table} failed:`, err);
    }
    return defaultSeed;
  }

  // 2. If on browser client side, try Cloudflare D1 Edge API as primary source
  try {
    const res = await fetch(`/api/entities/${table}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; records?: T[] };
      if (data && data.success && Array.isArray(data.records) && data.records.length > 0) {
        // Mirror authoritative D1 data to localStorage
        try {
          localStorage.setItem(getStorageKey(table), JSON.stringify(data.records));
        } catch {
          // ignore storage quota
        }
        return data.records;
      }
    }
  } catch (err) {
    console.warn(`[DataStore Client] D1 query for table ${table} deferred to cache:`, err);
  }

  // 3. Fallback to local storage mirror in browser
  try {
    const localRaw = localStorage.getItem(getStorageKey(table));
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any missing seed records into local cache
        if (defaultSeed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missingSeeds = defaultSeed.filter((s: any) => !existingIds.has(s.id));
          if (missingSeeds.length > 0) {
            const merged = [...parsed, ...missingSeeds];
            localStorage.setItem(getStorageKey(table), JSON.stringify(merged));
            return merged;
          }
        }
        return parsed;
      }
    }
  } catch {
    // parse error
  }

  // 4. Fallback to default seed & prime local storage
  if (defaultSeed.length > 0) {
    try {
      localStorage.setItem(getStorageKey(table), JSON.stringify(defaultSeed));
    } catch {
      // ignore
    }
  }

  return defaultSeed;
}

/**
 * Save a single entity record to Cloudflare D1 and sync local mirror
 */
export async function saveEntity<T extends { id?: string }>(
  table: EntityTable,
  record: T
): Promise<{ success: boolean; mode: 'd1' | 'local' }> {
  // Ensure record has ID
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
    const idx = currentList.findIndex((r: any) => r.id === item.id);
    if (idx >= 0) {
      currentList[idx] = item;
    } else {
      currentList.unshift(item);
    }
    localStorage.setItem(getStorageKey(table), JSON.stringify(currentList));
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
    const newItemsMap = new Map(records.map(r => [r.id || `${table}-${Math.random()}`, r]));

    const updated = currentList.map(r => newItemsMap.has(r.id) ? newItemsMap.get(r.id) : r);
    // Append any new IDs not in current list
    const existingIds = new Set(currentList.map(r => r.id));
    records.forEach(r => {
      if (!existingIds.has(r.id)) updated.push(r);
    });

    localStorage.setItem(getStorageKey(table), JSON.stringify(updated.length > 0 ? updated : records));
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
