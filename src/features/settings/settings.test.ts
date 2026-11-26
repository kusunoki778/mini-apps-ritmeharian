import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS, sanitizeSettings } from './settings';

describe('DEFAULT_SETTINGS', () => {
  it('memakai Senin, Celsius, 24 jam, dan tema sistem', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      theme: 'system',
      temperatureUnit: 'celsius',
      clockFormat: '24h',
      weekStart: 1,
    });
  });
});

describe('sanitizeSettings', () => {
  it('menjaga nilai yang valid', () => {
    expect(
      sanitizeSettings({
        theme: 'dark',
        clockFormat: '12h',
        weekStart: 0,
        temperatureUnit: 'fahrenheit',
      }),
    ).toEqual({
      theme: 'dark',
      clockFormat: '12h',
      weekStart: 0,
      temperatureUnit: 'fahrenheit',
    });
  });

  it('membuang nilai yang tidak dikenal', () => {
    expect(
      sanitizeSettings({
        theme: 'neon',
        clockFormat: '13h',
        weekStart: 2,
        temperatureUnit: 'kelvin',
      }),
    ).toEqual({});
  });

  it('mengembalikan objek kosong untuk masukan bukan objek', () => {
    expect(sanitizeSettings(null)).toEqual({});
    expect(sanitizeSettings('nadi')).toEqual({});
  });
});
