import { readCache, writeCache } from '@/lib/db/cache';
import type { CacheEntry } from '@/lib/db/db';
import { fetchAirQualityFromApi, type AirQualityResponse } from './air-api';

export interface AirResult {
  data: AirQualityResponse;
  fetchedAt: number;
  stale: boolean;
}

export interface AirDeps {
  fetchAir: (lat: number, lon: number, signal?: AbortSignal) => Promise<AirQualityResponse>;
  readCache: (key: string) => Promise<CacheEntry<AirQualityResponse> | undefined>;
  writeCache: (key: string, payload: AirQualityResponse) => Promise<void>;
  now: () => number;
}

export function airCacheKey(lat: number, lon: number): string {
  return `air:${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export async function loadAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal,
  overrides: Partial<AirDeps> = {},
): Promise<AirResult> {
  const deps: AirDeps = {
    fetchAir: fetchAirQualityFromApi,
    readCache,
    writeCache,
    now: Date.now,
    ...overrides,
  };
  const key = airCacheKey(lat, lon);

  try {
    const data = await deps.fetchAir(lat, lon, signal);
    await deps.writeCache(key, data);
    return { data, fetchedAt: deps.now(), stale: false };
  } catch (error) {
    if (signal?.aborted) throw error;

    const cached = await deps.readCache(key);
    if (cached) {
      return { data: cached.payload, fetchedAt: cached.fetchedAt, stale: true };
    }

    throw error instanceof Error ? error : new Error('Data kualitas udara tidak tersedia.');
  }
}
