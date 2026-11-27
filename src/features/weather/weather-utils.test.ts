import { describe, expect, it } from 'vitest';

import {
  comfortIndex,
  currentHourIndex,
  formatClock,
  hourIsDaylight,
  formatUpdatedAt,
  uvLevel,
} from './weather-utils';

describe('formatClock', () => {
  it('mengubah ISO lokal menjadi jam bertitik', () => {
    expect(formatClock('2026-11-26T05:28')).toBe('05.28');
    expect(formatClock('2026-11-26T17:52')).toBe('17.52');
  });
});

describe('formatUpdatedAt', () => {
  it('memberi awalan yang jelas', () => {
    expect(formatUpdatedAt(Date.now())).toMatch(/^Diperbarui \d{2}\.\d{2}$/);
  });
});

describe('hourIsDaylight', () => {
  const sunrise = ['2026-11-26T05:28'];
  const sunset = ['2026-11-26T17:52'];

  it('siang di antara terbit dan terbenam', () => {
    expect(hourIsDaylight('2026-11-26T12:00', sunrise, sunset)).toBe(true);
  });

  it('malam di luar rentang', () => {
    expect(hourIsDaylight('2026-11-26T20:00', sunrise, sunset)).toBe(false);
    expect(hourIsDaylight('2026-11-26T04:00', sunrise, sunset)).toBe(false);
  });

  it('menganggap siang saat data hari tidak ada', () => {
    expect(hourIsDaylight('2026-12-31T23:00', sunrise, sunset)).toBe(true);
  });
});

describe('currentHourIndex', () => {
  const times = ['2026-11-26T19:00', '2026-11-26T20:00', '2026-11-26T21:00'];

  it('memilih jam yang sedang berjalan', () => {
    expect(currentHourIndex(times, new Date(2026, 10, 26, 20, 30))).toBe(1);
  });

  it('memilih jam pertama saat sekarang sebelum data', () => {
    expect(currentHourIndex(times, new Date(2026, 10, 26, 8, 0))).toBe(0);
  });

  it('memilih jam terakhir saat data sudah lewat', () => {
    expect(currentHourIndex(times, new Date(2026, 10, 27, 3, 0))).toBe(2);
  });
});

describe('uvLevel', () => {
  it('memetakan angka UV ke tingkat paparan', () => {
    expect(uvLevel(0)).toBe('Rendah');
    expect(uvLevel(4)).toBe('Sedang');
    expect(uvLevel(7)).toBe('Tinggi');
    expect(uvLevel(9)).toBe('Sangat tinggi');
    expect(uvLevel(12)).toBe('Ekstrem');
  });
});

describe('comfortIndex', () => {
  it('memberi nilai tinggi saat cuaca sejuk dan kering', () => {
    const result = comfortIndex({
      apparentTemperature: 24,
      humidity: 50,
      windSpeed: 8,
      uvIndex: 2,
      precipitation: 0,
    });
    expect(result.score).toBe(100);
    expect(result.label).toBe('Nyaman');
  });

  it('menurunkan nilai saat panas, lembap, dan UV tinggi', () => {
    const result = comfortIndex({
      apparentTemperature: 34,
      humidity: 88,
      windSpeed: 10,
      uvIndex: 11,
      precipitation: 0,
    });
    expect(result.score).toBeLessThan(60);
    expect(result.label).not.toBe('Nyaman');
  });

  it('tidak pernah keluar dari rentang 0 sampai 100', () => {
    const result = comfortIndex({
      apparentTemperature: 50,
      humidity: 100,
      windSpeed: 90,
      uvIndex: 20,
      precipitation: 30,
    });
    expect(result.score).toBe(0);
  });
});
