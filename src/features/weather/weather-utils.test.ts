import { describe, expect, it } from 'vitest';

import {
  currentHourIndex,
  formatClock,
  hourIsDaylight,
  formatUpdatedAt,
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
