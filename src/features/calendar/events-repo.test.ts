import { beforeEach, describe, expect, it } from 'vitest';

import { db, type CalendarEvent } from '@/lib/db/db';
import { combineDateAndTime, dayStart, parseDateKey } from './calendar-utils';
import {
  buildEventFields,
  createEvent,
  deleteEvent,
  listEventsBetween,
  sortEvents,
  updateEvent,
  type EventInput,
} from './events-repo';

const base: CalendarEvent = {
  id: 'x',
  title: 't',
  start: 0,
  end: null,
  allDay: false,
  createdAt: 0,
  updatedAt: 0,
};

function input(overrides: Partial<EventInput> = {}): EventInput {
  return {
    title: 'Rapat',
    date: '2026-11-26',
    allDay: false,
    startTime: '09:00',
    endTime: '10:00',
    note: '',
    ...overrides,
  };
}

describe('buildEventFields', () => {
  it('menghitung waktu mulai dan selesai agenda berjam', () => {
    const fields = buildEventFields(input());

    expect(fields.start).toBe(combineDateAndTime('2026-11-26', '09:00'));
    expect(fields.end).toBe(combineDateAndTime('2026-11-26', '10:00'));
    expect(fields.allDay).toBe(false);
  });

  it('menaruh agenda sepanjang hari di tengah malam', () => {
    const fields = buildEventFields(input({ allDay: true }));

    expect(fields.start).toBe(dayStart(parseDateKey('2026-11-26')));
    expect(fields.end).toBeNull();
  });

  it('menyimpan catatan kosong sebagai undefined dan memangkas judul', () => {
    const fields = buildEventFields(input({ title: '  Rapat  ', note: '   ' }));

    expect(fields.title).toBe('Rapat');
    expect(fields.note).toBeUndefined();
  });
});

describe('sortEvents', () => {
  it('mengurutkan menaik berdasarkan waktu mulai', () => {
    const events: CalendarEvent[] = [
      { ...base, id: 'b', start: 200 },
      { ...base, id: 'a', start: 100 },
      { ...base, id: 'c', start: 300 },
    ];

    expect(sortEvents(events).map((event) => event.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('repositori events', () => {
  beforeEach(async () => {
    await db.events.clear();
  });

  it('membuat, membaca rentang, memperbarui, dan menghapus', async () => {
    const id = await createEvent(input({ date: '2026-11-26', startTime: '09:00' }));
    await createEvent(input({ title: 'Lusa', date: '2026-11-30', startTime: '08:00' }));

    const from = dayStart(parseDateKey('2026-11-26'));
    const to = dayStart(parseDateKey('2026-11-27'));
    const inRange = await listEventsBetween(from, to);

    expect(inRange).toHaveLength(1);
    expect(inRange[0].id).toBe(id);

    await updateEvent(id, input({ title: 'Rapat baru', startTime: '13:00' }));
    const updated = await db.events.get(id);
    expect(updated?.title).toBe('Rapat baru');
    expect(updated?.start).toBe(combineDateAndTime('2026-11-26', '13:00'));

    await deleteEvent(id);
    expect(await db.events.get(id)).toBeUndefined();
  });

  it('rentang memakai batas bawah inklusif dan batas atas eksklusif', async () => {
    await db.events.add({
      ...base,
      id: 'boundary',
      start: dayStart(parseDateKey('2026-11-27')),
    });

    const to = dayStart(parseDateKey('2026-11-27'));
    expect(await listEventsBetween(dayStart(parseDateKey('2026-11-26')), to)).toHaveLength(0);
    expect(await listEventsBetween(to, to + 1)).toHaveLength(1);
  });
});
