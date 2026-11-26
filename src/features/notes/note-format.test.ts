import { describe, expect, it } from 'vitest';

import { formatNoteTime } from './note-format';

const now = new Date(2026, 10, 26, 12, 0);

describe('formatNoteTime', () => {
  it('menandai catatan hari ini', () => {
    expect(formatNoteTime(new Date(2026, 10, 26, 8, 5).getTime(), now)).toBe('Hari ini, 08.05');
  });

  it('menandai catatan kemarin', () => {
    expect(formatNoteTime(new Date(2026, 10, 25, 9, 30).getTime(), now)).toBe('Kemarin, 09.30');
  });

  it('memakai tanggal singkat untuk hari lain di tahun yang sama', () => {
    expect(formatNoteTime(new Date(2026, 0, 3, 7, 0).getTime(), now)).toBe('3 Jan');
  });

  it('menyertakan tahun untuk tahun berbeda', () => {
    expect(formatNoteTime(new Date(2025, 11, 31, 7, 0).getTime(), now)).toContain('2025');
  });
});
