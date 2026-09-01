// src/lib/storage.ts - Cloudflare R2 Storage Client & Fallback
import type { CloudflareEnv } from './db';

export async function uploadToR2(
  key: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string = 'image/jpeg',
  env?: CloudflareEnv
): Promise<string> {
  try {
    if (env?.STORAGE) {
      await env.STORAGE.put(key, data, {
        httpMetadata: { contentType }
      });
      return `/cdn-cgi/r2/${key}`;
    }
  } catch (err) {
    console.warn('R2 storage upload error, using fallback:', err);
  }
  return `/uploads/${key}`;
}

export async function getR2ObjectUrl(key: string, env?: CloudflareEnv): Promise<string> {
  if (key.startsWith('http')) return key;
  return `/cdn-cgi/r2/${key}`;
}
