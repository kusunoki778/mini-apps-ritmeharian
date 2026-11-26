import { describe, expect, it } from 'vitest';

import { buildWeatherUrl, parseWeatherResponse } from './weather-api';
import { SAMPLE_WEATHER } from './weather-fixtures';

describe('parseWeatherResponse', () => {
  it('menerima payload yang lengkap', () => {
    expect(parseWeatherResponse(SAMPLE_WEATHER)).toEqual(SAMPLE_WEATHER);
  });

  it('menolak payload yang kehilangan bagian wajib', () => {
    expect(parseWeatherResponse(null)).toBeNull();
    expect(parseWeatherResponse({ current: {}, hourly: {}, daily: {} })).toBeNull();
  });

  it('menolak deret angka yang berisi teks', () => {
    const broken = {
      ...SAMPLE_WEATHER,
      hourly: { ...SAMPLE_WEATHER.hourly, temperature_2m: [28.4, 'panas'] },
    };

    expect(parseWeatherResponse(broken)).toBeNull();
  });
});

describe('buildWeatherUrl', () => {
  it('memuat parameter wajib', () => {
    const url = new URL(buildWeatherUrl(-6.2088, 106.8456));

    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('-6.2088');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('forecast_days')).toBe('7');
    expect(url.searchParams.get('daily')).toContain('sunrise');
    expect(url.searchParams.get('current')).toContain('weather_code');
  });
});
