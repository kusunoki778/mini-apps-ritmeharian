import { useLiveQuery } from 'dexie-react-hooks';

import type { CalendarEvent } from '@/lib/db/db';
import { listEventsBetween, listUpcomingReminders } from './events-repo';

export function useEventsBetween(fromMs: number, toMs: number): CalendarEvent[] | undefined {
  return useLiveQuery(() => listEventsBetween(fromMs, toMs), [fromMs, toMs]);
}

export function useRemindersBetween(fromMs: number, toMs: number): CalendarEvent[] | undefined {
  return useLiveQuery(() => listUpcomingReminders(fromMs, toMs), [fromMs, toMs]);
}
