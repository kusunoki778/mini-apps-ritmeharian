import { describe, expect, it } from 'vitest';

import { hasEventErrors, validateEvent } from './event-validation';
import type { EventInput } from './events-repo';

function input(overrides: Partial<EventInput> = {}): EventInput {
  return {
    title: 'Rapat',
    date: '2026-11-26',
    allDay: false,
    startTime: '09:00',
    endTime: '10:00',
    note: '',
    reminderMinutes: null,
    reminderSoundId: 'nadi',
    ...overrides,
  };
}

describe('validateEvent', () => {
  it('menerima agenda yang sah', () => {
    expect(hasEventErrors(validateEvent(input()))).toBe(false);
  });

  it('menandai judul dan tanggal wajib', () => {
    expect(validateEvent(input({ title: '  ' })).title).toBeDefined();
    expect(validateEvent(input({ date: '' })).date).toBeDefined();
  });

  it('menolak waktu selesai sebelum atau sama dengan mulai', () => {
    expect(validateEvent(input({ startTime: '10:00', endTime: '09:00' })).endTime).toBeDefined();
    expect(validateEvent(input({ startTime: '10:00', endTime: '10:00' })).endTime).toBeDefined();
    expect(validateEvent(input({ startTime: '10:00', endTime: '11:00' })).endTime).toBeUndefined();
  });

  it('mengabaikan waktu saat sepanjang hari', () => {
    expect(
      validateEvent(input({ allDay: true, startTime: '10:00', endTime: '09:00' })).endTime,
    ).toBeUndefined();
  });
});
