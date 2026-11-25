import { describe, expect, it } from 'vitest';

import { clockFraction, clockMinutes, dayFraction } from './day-line';

function at(hours: number, minutes: number, seconds = 0, ms = 0): Date {
  return new Date(2026, 0, 1, hours, minutes, seconds, ms);
}

describe('dayFraction', () => {
  it('nol tepat di awal hari', () => {
    expect(dayFraction(at(0, 0))).toBe(0);
  });

  it('setengah di tengah hari', () => {
    expect(dayFraction(at(12, 0))).toBe(0.5);
  });

  it('mendekati satu di akhir hari, tidak melewati satu', () => {
    expect(dayFraction(at(23, 59))).toBeCloseTo(1439 / 1440, 6);
    expect(dayFraction(at(23, 59, 59, 999))).toBeLessThanOrEqual(1);
  });
});

describe('clockFraction', () => {
  it('menerima titik dan titik dua', () => {
    expect(clockFraction('05.42')).toBeCloseTo(342 / 1440, 6);
    expect(clockFraction('18:03')).toBeCloseTo(1083 / 1440, 6);
  });

  it('menolak nilai tidak valid', () => {
    expect(clockFraction('24.00')).toBeNull();
    expect(clockFraction('12.60')).toBeNull();
    expect(clockFraction('pagi')).toBeNull();
  });
});

describe('clockMinutes', () => {
  it('mengubah jam menjadi menit sejak tengah malam', () => {
    expect(clockMinutes('09.30')).toBe(570);
    expect(clockMinutes('00:00')).toBe(0);
    expect(clockMinutes('bukan jam')).toBeNull();
  });
});
