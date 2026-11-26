import { describe, expect, it } from 'vitest';

import { convertTemperature, formatTemperature } from './units';

describe('convertTemperature', () => {
  it('membiarkan Celsius apa adanya', () => {
    expect(convertTemperature(25, 'celsius')).toBe(25);
  });

  it('mengubah ke Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
  });
});

describe('formatTemperature', () => {
  it('membulatkan dan menambah lambang derajat', () => {
    expect(formatTemperature(12.4, 'celsius')).toBe('12°');
    expect(formatTemperature(-3.6, 'celsius')).toBe('-4°');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°');
  });
});
