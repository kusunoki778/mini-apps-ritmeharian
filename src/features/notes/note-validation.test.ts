import { describe, expect, it } from 'vitest';

import { hasErrors, validateNote } from './note-validation';

describe('validateNote', () => {
  it('menerima catatan yang sah', () => {
    expect(hasErrors(validateNote('Judul', 'Isi catatan'))).toBe(false);
  });

  it('menolak judul atau isi yang kosong', () => {
    expect(validateNote('   ', 'Isi').title).toBeDefined();
    expect(validateNote('Judul', '   ').body).toBeDefined();
  });

  it('menerima tepat 80 dan 5000 karakter', () => {
    const errors = validateNote('a'.repeat(80), 'b'.repeat(5000));

    expect(errors.title).toBeUndefined();
    expect(errors.body).toBeUndefined();
  });

  it('menolak 81 dan 5001 karakter', () => {
    expect(validateNote('a'.repeat(81), 'b').title).toBeDefined();
    expect(validateNote('a', 'b'.repeat(5001)).body).toBeDefined();
  });
});
