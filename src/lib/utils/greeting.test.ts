import { describe, expect, it } from 'vitest';

import { getGreeting } from './greeting';

describe('getGreeting', () => {
  it.each([
    [4, 'Selamat pagi'],
    [10, 'Selamat pagi'],
    [11, 'Selamat siang'],
    [14, 'Selamat siang'],
    [15, 'Selamat sore'],
    [17, 'Selamat sore'],
    [18, 'Selamat malam'],
    [3, 'Selamat malam'],
  ])('jam %i menghasilkan %s', (hour, expected) => {
    expect(getGreeting(hour)).toBe(expected);
  });
});
