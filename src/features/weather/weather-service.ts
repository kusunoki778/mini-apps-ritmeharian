import { readCache, writeCache } from '@/lib/db/cache';
import type { CacheEntry } from '@/lib/db/db';
import { fetchWeatherFromApi, type WeatherResponse } from './weather-api';

export interface WeatherResult {
  data: WeatherResponse;
  fetchedAt: number;
  stale: boolean;
}

export interface WeatherDeps {
  fetchWeather: (lat: number, lon: number, signal?: AbortSignal) => Promise<WeatherResponse>;
  readCache: (key: string) => Promise<CacheEntry<WeatherResponse> | undefined>;
  writeCache: (key: string, payload: WeatherResponse) => Promise<void>;
  now: () => number;
}

export function weatherCacheKey(lat: number, lon: number): string {
  return `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export async function loadWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
  overrides: Partial<WeatherDeps> = {},
): Promise<WeatherResult> {
  const deps: WeatherDeps = {
    fetchWeather: fetchWeatherFromApi,
    readCache,
    writeCache,
    now: Date.now,
    ...overrides,
  };
  const key = weatherCacheKey(lat, lon);

  try {
    const data = await deps.fetchWeather(lat, lon, signal);
    await deps.writeCache(key, data);
    return { data, fetchedAt: deps.now(), stale: false };
  } catch (error) {
    // Pembatalan oleh pemanggil bukan kegagalan jaringan, jadi tidak memakai cache.
    if (signal?.aborted) throw error;

    const cached = await deps.readCache(key);
    if (cached) {
      return { data: cached.payload, fetchedAt: cached.fetchedAt, stale: true };
    }

    throw error instanceof Error ? error : new Error('Data cuaca tidak tersedia.');
  }
}
