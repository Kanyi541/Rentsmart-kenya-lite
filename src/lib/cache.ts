// src/lib/cache.ts

type CacheEntry<T> = {
  value: T;
  expiry: number; // epoch ms
};

const cache = new Map<string, CacheEntry<any>>();

/**
 * Retrieve a cached value or compute and store it.
 * ttlSeconds - time to live in seconds (default 300 seconds = 5 minutes)
 */
export async function getOrSet<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expiry > now) {
    return entry.value as T;
  }
  const value = await loader();
  cache.set(key, { value, expiry: now + ttlSeconds * 1000 });
  return value;
}

/**
 * Simple helper to clear cache (useful for testing or manual invalidation).
 */
export function clearCache(): void {
  cache.clear();
}
