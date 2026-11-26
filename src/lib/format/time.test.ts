import { describe, expect, it } from 'vitest';

import { formatClockParts, formatTimeOfDay } from './time';

describe('formatClockParts', () => {
  it('memakai dua digit pada format 24 jam', () => {
    expect(formatClockParts(5, 7, '24h')).toBe('05.07');
    expect(formatClockParts(17, 52, '24h')).toBe('17.52');
  });

  it('menambahkan penanda AM dan PM pada format 12 jam', () => {
    expect(formatClockParts(5, 7, '12h')).toBe('05.07 AM');
    expect(formatClockParts(0, 0, '12h')).toBe('12.00 AM');
    expect(formatClockParts(12, 30, '12h')).toBe('12.30 PM');
    expect(formatClockParts(17, 52, '12h')).toBe('05.52 PM');
  });
});

describe('formatTimeOfDay', () => {
  it('membaca jam dan menit dari tanggal', () => {
    expect(formatTimeOfDay(new Date(2026, 10, 26, 9, 5), '24h')).toBe('09.05');
    expect(formatTimeOfDay(new Date(2026, 10, 26, 21, 5), '12h')).toBe('09.05 PM');
  });
});
