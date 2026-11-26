import { db, type CalendarEvent } from '@/lib/db/db';
import { createId } from '@/lib/utils/id';
import { combineDateAndTime, dayStart, parseDateKey } from './calendar-utils';

export interface EventInput {
  title: string;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  note: string;
}

interface EventFields {
  title: string;
  start: number;
  end: number | null;
  allDay: boolean;
  note?: string;
}

export function buildEventFields(input: EventInput): EventFields {
  const title = input.title.trim();
  const note = input.note.trim();

  if (input.allDay) {
    return { title, start: dayStart(parseDateKey(input.date)), end: null, allDay: true, note: note || undefined };
  }

  const start = combineDateAndTime(input.date, input.startTime || '00:00');
  const end = input.endTime ? combineDateAndTime(input.date, input.endTime) : null;

  return { title, start, end, allDay: false, note: note || undefined };
}

// Agenda diurutkan menaik berdasarkan waktu mulai.
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.start - b.start);
}

export async function listEventsBetween(fromMs: number, toMs: number): Promise<CalendarEvent[]> {
  const events = await db.events.where('start').between(fromMs, toMs, true, false).toArray();

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
