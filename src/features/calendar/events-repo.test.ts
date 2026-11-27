import { beforeEach, describe, expect, it } from 'vitest';

import { db, type CalendarEvent } from '@/lib/db/db';
import { combineDateAndTime, dayStart, parseDateKey, toDateKey } from './calendar-utils';
import {
  buildEventFields,
  createEvent,
  deleteEvent,
  listEventsBetween,
  listUpcomingReminders,
  markReminderFired,
  reminderTimeOf,
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
    repeat: 'none',
    note: '',
    reminderMinutes: null,
    reminderSoundId: 'nadi',
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

  it('menyertakan pengingat bila diatur dan melewatkannya bila null', () => {
    const withReminder = buildEventFields(input({ reminderMinutes: 10, reminderSoundId: 'tegas' }));
    expect(withReminder.reminderMinutes).toBe(10);
    expect(withReminder.reminderSoundId).toBe('tegas');

    const without = buildEventFields(input({ reminderMinutes: null }));
    expect(without.reminderMinutes).toBeUndefined();
    expect(without.reminderSoundId).toBeUndefined();
  });

  it('tetap menyertakan pengingat untuk agenda sepanjang hari', () => {
    const fields = buildEventFields(input({ allDay: true, reminderMinutes: 30 }));
    expect(fields.reminderMinutes).toBe(30);
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

  it('menghitung waktu pengingat dari menit sebelum mulai', () => {
    const event: CalendarEvent = { ...base, start: 1_000_000, reminderMinutes: 10 };
    expect(reminderTimeOf(event)).toBe(1_000_000 - 600_000);
  });

  it('tidak punya waktu pengingat bila tidak diatur', () => {
    expect(reminderTimeOf({ ...base, reminderMinutes: null })).toBeNull();
    expect(reminderTimeOf(base)).toBeNull();
  });

  it('menyaring hanya agenda berpengingat dalam rentang', async () => {
    await createEvent(input({ date: '2026-11-26', reminderMinutes: 5, reminderSoundId: 'nadi' }));
    await createEvent(input({ date: '2026-11-27', reminderMinutes: null }));

    const from = dayStart(parseDateKey('2026-11-26'));
    const to = dayStart(parseDateKey('2026-11-28'));
    const reminders = await listUpcomingReminders(from, to);

    expect(reminders).toHaveLength(1);
    expect(reminders[0].reminderMinutes).toBe(5);
  });

  it('menandai pengingat sudah berbunyi', async () => {
    const id = await createEvent(input({ reminderMinutes: 0 }));

    await markReminderFired(id, 12345);

    expect((await db.events.get(id))?.reminderFiredAt).toBe(12345);
  });
});

describe('agenda berulang', () => {
  beforeEach(async () => {
    await db.events.clear();
  });

  it('menjabarkan agenda harian ke setiap hari dalam rentang', async () => {
    await createEvent(
      input({ date: '2026-11-26', startTime: '09:00', endTime: '10:00', repeat: 'daily' }),
    );

    const from = dayStart(parseDateKey('2026-11-26'));
    const to = dayStart(parseDateKey('2026-11-29'));
    const events = await listEventsBetween(from, to);

    expect(events.map((event) => toDateKey(new Date(event.start)))).toEqual([
      '2026-11-26',
      '2026-11-27',
      '2026-11-28',
    ]);
    expect((events[0].end ?? 0) - events[0].start).toBe(60 * 60_000);
  });

  it('menjabarkan agenda mingguan di hari yang sama', async () => {
    await createEvent(input({ date: '2026-11-26', repeat: 'weekly' }));

    const from = dayStart(parseDateKey('2026-11-26'));
    const to = dayStart(parseDateKey('2026-12-18'));
    const events = await listEventsBetween(from, to);

    expect(events.map((event) => toDateKey(new Date(event.start)))).toEqual([
      '2026-11-26',
      '2026-12-03',
      '2026-12-10',
      '2026-12-17',
    ]);
  });

  it('menjabarkan agenda bulanan di tanggal yang sama', async () => {
    await createEvent(input({ date: '2026-11-26', repeat: 'monthly' }));

    const from = dayStart(parseDateKey('2026-11-01'));
    const to = dayStart(parseDateKey('2027-02-01'));
    const events = await listEventsBetween(from, to);

    expect(events.map((event) => toDateKey(new Date(event.start)))).toEqual([
      '2026-11-26',
      '2026-12-26',
      '2027-01-26',
    ]);
  });

  it('menghitung pengingat untuk setiap kemunculan berulang', async () => {
    await createEvent(input({ date: '2026-11-26', reminderMinutes: 0, repeat: 'daily' }));

    const from = dayStart(parseDateKey('2026-11-26'));
    const to = dayStart(parseDateKey('2026-11-29'));
    const reminders = await listUpcomingReminders(from, to);

    expect(reminders).toHaveLength(3);
  });
});
