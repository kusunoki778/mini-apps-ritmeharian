import { describe, expect, it } from 'vitest';

import { categorizeUsAqi } from './categories';

describe('categorizeUsAqi', () => {
  it.each([
    [0, 'good'],
    [50, 'good'],
    [51, 'moderate'],
    [100, 'moderate'],
    [101, 'sensitive'],
    [150, 'sensitive'],
    [151, 'unhealthy'],
    [200, 'unhealthy'],
    [201, 'very-unhealthy'],
    [300, 'very-unhealthy'],
    [301, 'hazardous'],
    [500, 'hazardous'],
  ])('nilai %i masuk kategori %s', (value, key) => {
    expect(categorizeUsAqi(value).key).toBe(key);
  });

  it('selalu memberi label dan saran', () => {
    for (const value of [0, 75, 125, 175, 250, 400]) {
      const category = categorizeUsAqi(value);
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.advice.length).toBeGreaterThan(0);
      expect(category.color).toMatch(/^var\(--aqi-/);
    }
  });
});
