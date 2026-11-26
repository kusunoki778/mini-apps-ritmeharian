import { describe, expect, it } from 'vitest';

import { describeWeather, UNKNOWN_WEATHER } from './wmo';

const EXPECTED: Record<number, string> = {
  0: 'Cerah',
  1: 'Cerah berawan',
  2: 'Berawan',
  3: 'Mendung',
  45: 'Kabut',
  48: 'Kabut berembun',
  51: 'Gerimis ringan',
  53: 'Gerimis',
  55: 'Gerimis lebat',
  56: 'Gerimis beku ringan',
  57: 'Gerimis beku lebat',
  61: 'Hujan ringan',
  63: 'Hujan',
  65: 'Hujan lebat',
  66: 'Hujan beku ringan',
  67: 'Hujan beku lebat',
  71: 'Salju ringan',
  73: 'Salju',
  75: 'Salju lebat',
  77: 'Butir salju',
  80: 'Hujan lokal ringan',
  81: 'Hujan lokal',
  82: 'Hujan lokal lebat',
  85: 'Hujan salju lokal ringan',
  86: 'Hujan salju lokal lebat',
  95: 'Badai petir',
  96: 'Badai petir dengan hujan es ringan',
  99: 'Badai petir dengan hujan es lebat',
};

describe('describeWeather', () => {
  it('memetakan setiap kode WMO yang dikenal', () => {
    for (const [code, label] of Object.entries(EXPECTED)) {
      expect(describeWeather(Number(code)).label).toBe(label);
    }
  });

  it('memakai label fallback untuk kode tidak dikenal', () => {
    expect(describeWeather(999)).toEqual(UNKNOWN_WEATHER);
    expect(describeWeather(-1).label).toBe('Tidak diketahui');
  });

  it('memberi grup ikon yang konsisten', () => {
    expect(describeWeather(0).icon).toBe('clear');
    expect(describeWeather(3).icon).toBe('overcast');
    expect(describeWeather(65).icon).toBe('rain');
    expect(describeWeather(75).icon).toBe('snow');
    expect(describeWeather(95).icon).toBe('thunder');
  });
});
