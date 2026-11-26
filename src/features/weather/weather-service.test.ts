import { describe, expect, it, vi } from 'vitest';

import type { CacheEntry } from '@/lib/db/db';
import { SAMPLE_WEATHER } from './weather-fixtures';
import { loadWeather, weatherCacheKey, type WeatherDeps } from './weather-service';

function makeDeps(overrides: Partial<WeatherDeps> = {}): WeatherDeps {
  return {
    fetchWeather: vi.fn().mockResolvedValue(SAMPLE_WEATHER),
    readCache: vi.fn().mockResolvedValue(undefined),
    writeCache: vi.fn().mockResolvedValue(undefined),
    now: () => 1_700_000_000_000,
    ...overrides,
  };
}

describe('loadWeather', () => {
  it('memakai data jaringan lalu menyimpannya ke cache', async () => {
    const deps = makeDeps();
    const result = await loadWeather(-6.2088, 106.8456, undefined, deps);

    expect(result.stale).toBe(false);
    expect(result.data).toEqual(SAMPLE_WEATHER);
    expect(deps.writeCache).toHaveBeenCalledWith(weatherCacheKey(-6.2088, 106.8456), SAMPLE_WEATHER);
  });

  it('memakai cache saat jaringan gagal, seperti saat offline atau timeout', async () => {
    const cached: CacheEntry<typeof SAMPLE_WEATHER> = {
      key: weatherCacheKey(-6.2088, 106.8456),
      fetchedAt: 1_600_000_000_000,
      payload: SAMPLE_WEATHER,
    };
    const deps = makeDeps({
      fetchWeather: vi.fn().mockRejectedValue(new Error('timeout')),
      readCache: vi.fn().mockResolvedValue(cached),
    });

    const result = await loadWeather(-6.2088, 106.8456, undefined, deps);

    expect(result.stale).toBe(true);
    expect(result.fetchedAt).toBe(1_600_000_000_000);
    expect(result.data).toEqual(SAMPLE_WEATHER);
  });

  it('melempar error saat gagal dan tidak ada cache', async () => {
    const deps = makeDeps({
      fetchWeather: vi.fn().mockRejectedValue(new Error('jaringan putus')),
    });

    await expect(loadWeather(-6.2088, 106.8456, undefined, deps)).rejects.toThrow('jaringan putus');
  });

  it('tidak membaca cache saat permintaan dibatalkan pemanggil', async () => {
    const controller = new AbortController();
    controller.abort();
    const readCache = vi.fn().mockResolvedValue(undefined);
    const deps = makeDeps({
      fetchWeather: vi.fn().mockRejectedValue(new Error('aborted')),
      readCache,
    });

    await expect(loadWeather(-6.2088, 106.8456, controller.signal, deps)).rejects.toThrow('aborted');
    expect(readCache).not.toHaveBeenCalled();
  });
});
