import { db, type CacheEntry } from './db';

export async function readCache<T>(key: string): Promise<CacheEntry<T> | undefined> {
  return (await db.cache.get(key)) as CacheEntry<T> | undefined;
}

export async function writeCache<T>(key: string, payload: T): Promise<void> {
  await db.cache.put({ key, fetchedAt: Date.now(), payload });
}
