import { describe, expect, it, vi } from 'vitest';

import type { CacheEntry } from '@/lib/db/db';
import { SAMPLE_AIR } from './air-fixtures';
import { airCacheKey, loadAirQuality, type AirDeps } from './air-service';

function makeDeps(overrides: Partial<AirDeps> = {}): AirDeps {
  return {
    fetchAir: vi.fn().mockResolvedValue(SAMPLE_AIR),
    readCache: vi.fn().mockResolvedValue(undefined),
    writeCache: vi.fn().mockResolvedValue(undefined),
    now: () => 1_700_000_000_000,
    ...overrides,
  };
}

describe('loadAirQuality', () => {
  it('memakai jaringan lalu menyimpan ke cache', async () => {
    const deps = makeDeps();
    const result = await loadAirQuality(-6.2088, 106.8456, undefined, deps);

    expect(result.stale).toBe(false);
    expect(deps.writeCache).toHaveBeenCalledWith(airCacheKey(-6.2088, 106.8456), SAMPLE_AIR);
  });

  it('memakai cache saat jaringan gagal', async () => {
    const cached: CacheEntry<typeof SAMPLE_AIR> = {
      key: airCacheKey(-6.2088, 106.8456),
      fetchedAt: 1_600_000_000_000,
      payload: SAMPLE_AIR,
    };
    const deps = makeDeps({
      fetchAir: vi.fn().mockRejectedValue(new Error('offline')),
      readCache: vi.fn().mockResolvedValue(cached),
    });

    const result = await loadAirQuality(-6.2088, 106.8456, undefined, deps);

    expect(result.stale).toBe(true);
    expect(result.fetchedAt).toBe(1_600_000_000_000);
  });

  it('melempar error saat gagal tanpa cache', async () => {
    const deps = makeDeps({ fetchAir: vi.fn().mockRejectedValue(new Error('gagal')) });
    await expect(loadAirQuality(-6.2088, 106.8456, undefined, deps)).rejects.toThrow('gagal');
  });

  it('tidak membaca cache saat dibatalkan pemanggil', async () => {
    const controller = new AbortController();
    controller.abort();
    const readCache = vi.fn().mockResolvedValue(undefined);
    const deps = makeDeps({ fetchAir: vi.fn().mockRejectedValue(new Error('aborted')), readCache });

    await expect(loadAirQuality(-6.2088, 106.8456, controller.signal, deps)).rejects.toThrow(
      'aborted',
    );
    expect(readCache).not.toHaveBeenCalled();
  });
});
