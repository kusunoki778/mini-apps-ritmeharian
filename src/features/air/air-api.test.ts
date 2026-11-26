import { describe, expect, it } from 'vitest';

import { buildAirUrl, parseAirQualityResponse } from './air-api';
import { SAMPLE_AIR } from './air-fixtures';

describe('parseAirQualityResponse', () => {
  it('menerima payload yang lengkap', () => {
    expect(parseAirQualityResponse(SAMPLE_AIR)).toEqual(SAMPLE_AIR);
  });

  it('menolak respons kosong', () => {
    expect(parseAirQualityResponse({})).toBeNull();
    expect(parseAirQualityResponse({ current: {}, hourly: {} })).toBeNull();
  });

  it('menolak saat nilai polutan hilang', () => {
    const broken = { ...SAMPLE_AIR, current: { ...SAMPLE_AIR.current, pm2_5: undefined } };
    expect(parseAirQualityResponse(broken)).toBeNull();
  });
});

describe('buildAirUrl', () => {
  it('memuat parameter wajib', () => {
    const url = new URL(buildAirUrl(-6.2088, 106.8456));

    expect(url.origin + url.pathname).toBe('https://air-quality-api.open-meteo.com/v1/air-quality');
    expect(url.searchParams.get('current')).toContain('us_aqi');
    expect(url.searchParams.get('hourly')).toBe('us_aqi,pm2_5');
    expect(url.searchParams.get('timezone')).toBe('auto');
  });
});
