import { addDays, addMonths } from 'date-fns';

import { db, type CalendarEvent, type EventRepeat } from '@/lib/db/db';
import { createId } from '@/lib/utils/id';
import { combineDateAndTime, dayStart, parseDateKey } from './calendar-utils';

export interface EventInput {
  title: string;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  repeat: EventRepeat;
  note: string;
  reminderMinutes: number | null;
  reminderSoundId: string;
}

interface EventFields {
  title: string;
  start: number;
  end: number | null;
  allDay: boolean;
  repeat: EventRepeat;
  note?: string;
  reminderMinutes?: number | null;
  reminderSoundId?: string;
}

export function buildEventFields(input: EventInput): EventFields {
  const title = input.title.trim();
  const note = input.note.trim();
  const reminder =
    input.reminderMinutes === null || input.reminderMinutes === undefined
      ? undefined
      : { reminderMinutes: input.reminderMinutes, reminderSoundId: input.reminderSoundId };

  if (input.allDay) {
    return {
      title,
      start: dayStart(parseDateKey(input.date)),
      end: null,
      allDay: true,
      repeat: input.repeat,
      note: note || undefined,
      ...reminder,
    };
  }

  const start = combineDateAndTime(input.date, input.startTime || '00:00');
  const end = input.endTime ? combineDateAndTime(input.date, input.endTime) : null;

  return {
    title,
    start,
    end,
    allDay: false,
    repeat: input.repeat,
    note: note || undefined,
    ...reminder,
  };
}

// Agenda diurutkan menaik berdasarkan waktu mulai.
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.start - b.start);
}

const DAY_MS = 86_400_000;
// Batas aman supaya data rusak tidak membuat perulangan tanpa henti.
const MAX_OCCURRENCES = 400;
// Jarak pengingat terjauh yang didukung formulir, dengan kelonggaran.
const MAX_REMINDER_LEAD_MS = 31 * DAY_MS;

// Awal kemunculan agenda yang jatuh di [fromMs, toMs). Agenda sekali jalan hanya
// punya satu kemunculan. Agenda berulang mengulang jam yang sama.
function occurrenceStarts(event: CalendarEvent, fromMs: number, toMs: number): number[] {
  const repeat = event.repeat ?? 'none';
  if (repeat === 'none') {
    return event.start >= fromMs && event.start < toMs ? [event.start] : [];
  }

  const starts: number[] = [];
  const base = new Date(event.start);

  if (repeat === 'monthly') {
    const from = new Date(fromMs);
    const monthDiff =
      (from.getFullYear() - base.getFullYear()) * 12 + (from.getMonth() - base.getMonth());
    let index = Math.max(0, monthDiff - 1);
    let at = addMonths(base, index).getTime();
    let guard = 0;
    while (at < fromMs && guard < MAX_OCCURRENCES) {
      index += 1;
      at = addMonths(base, index).getTime();
      guard += 1;
    }
    for (let count = 0; at < toMs && count < MAX_OCCURRENCES; count += 1) {
      starts.push(at);
      index += 1;
      at = addMonths(base, index).getTime();
    }
    return starts;
  }

  const stepDays = repeat === 'daily' ? 1 : 7;
  const stepMs = stepDays * DAY_MS;
  let index = Math.max(0, Math.floor((fromMs - event.start) / stepMs));
  let at = addDays(base, index * stepDays).getTime();
  let guard = 0;
  while (at < fromMs && guard < MAX_OCCURRENCES) {
    index += 1;
    at = addDays(base, index * stepDays).getTime();
    guard += 1;
  }
  for (let count = 0; at < toMs && count < MAX_OCCURRENCES; count += 1) {
    starts.push(at);
    index += 1;
    at = addDays(base, index * stepDays).getTime();
  }
  return starts;
}

// Salinan agenda dengan waktu mulai yang digeser ke satu kemunculan. Durasi asli
// dipertahankan supaya agenda berjam tetap punya jam selesai.
function occurrenceEvent(event: CalendarEvent, start: number): CalendarEvent {
  if (event.end == null) return { ...event, start };

  const duration = Math.max(0, event.end - event.start);
  return { ...event, start, end: start + duration };
}

export async function listEventsBetween(fromMs: number, toMs: number): Promise<CalendarEvent[]> {
  // Agenda berulang bisa mulai jauh sebelum rentang, jadi semua yang mulai sebelum
  // batas atas ikut dibaca lalu dijabarkan ke kemunculannya.
  const rows = await db.events.where('start').below(toMs).toArray();
  const events: CalendarEvent[] = [];

  for (const event of rows) {
    for (const start of occurrenceStarts(event, fromMs, toMs)) {
      events.push(occurrenceEvent(event, start));
    }
  }

  return sortEvents(events);
}

export async function listEventsForDay(date: Date): Promise<CalendarEvent[]> {
  const from = dayStart(date);
  const to = dayStart(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));

  return listEventsBetween(from, to);
}

export async function createEvent(input: EventInput): Promise<string> {
  const now = Date.now();
  const id = createId();

  await db.events.add({ id, ...buildEventFields(input), createdAt: now, updatedAt: now });

  return id;
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  await db.events.update(id, { ...buildEventFields(input), updatedAt: Date.now() });
}

export async function deleteEvent(id: string): Promise<void> {
  await db.events.delete(id);
}

// Tandai bahwa pengingat agenda sudah berbunyi, supaya tidak berbunyi berulang.
export async function markReminderFired(id: string, at: number): Promise<void> {
  await db.events.update(id, { reminderFiredAt: at });
}

// Agenda yang punya pengingat dan waktunya (mulai dikurangi menit pengingat) jatuh
// di dalam rentang. Dipakai penjadwal native dan mesin pengingat web.
export function reminderTimeOf(event: CalendarEvent): number | null {
  if (event.reminderMinutes == null) return null;
  return event.start - event.reminderMinutes * 60_000;
}

export async function listUpcomingReminders(
  fromMs: number,
  toMs: number,
): Promise<CalendarEvent[]> {
  const rows = await db.events
    .where('start')
    .below(toMs + MAX_REMINDER_LEAD_MS)
    .toArray();
  const events: CalendarEvent[] = [];

  for (const event of rows) {
    if (event.reminderMinutes == null) continue;
    const lead = event.reminderMinutes * 60_000;

    // Kemunculan dengan waktu pengingat di dalam rentang.
    for (const start of occurrenceStarts(event, fromMs + lead, toMs + lead)) {
      events.push(occurrenceEvent(event, start));
    }
  }

  return sortEvents(events);
}
