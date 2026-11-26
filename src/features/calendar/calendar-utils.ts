import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type { CalendarEvent } from '@/lib/db/db';
import type { WeekStart } from '@/features/settings/week-start';

const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
const FULL_DATE = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const TIME = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function dayStart(date: Date): number {
  return startOfDay(date).getTime();
}

export function dayEnd(date: Date): number {
  return startOfDay(addDays(date, 1)).getTime();
}

export function combineDateAndTime(dateKey: string, time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const date = parseDateKey(dateKey);
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  return date.getTime();
}

export function buildMonthGrid(month: Date, weekStart: WeekStart = 1): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: weekStart }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: weekStart }),
  });
}

export function monthRange(month: Date, weekStart: WeekStart = 1): { from: number; to: number } {
  const grid = buildMonthGrid(month, weekStart);
  const last = grid[grid.length - 1];

  return { from: dayStart(grid[0]), to: dayEnd(last) };
}

export function weekdayLabels(weekStart: WeekStart = 1): string[] {
  return weekStart === 1
    ? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    : ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
}

export function monthLabel(month: Date): string {
  return MONTH_LABEL.format(month);
}

export function fullDateLabel(date: Date): string {
  return FULL_DATE.format(date);
}

export function formatTime(timestamp: number): string {
  return TIME.format(new Date(timestamp));
}

export function toTimeInput(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}

export function formatEventTime(event: Pick<CalendarEvent, 'allDay' | 'start' | 'end'>): string {
  if (event.allDay) return 'Sepanjang hari';

  const start = formatTime(event.start);
  return event.end ? `${start}-${formatTime(event.end)}` : start;
}

export function groupByDayKey(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = toDateKey(new Date(event.start));
    const list = grouped.get(key);
    if (list) {
      list.push(event);
    } else {
      grouped.set(key, [event]);
    }
  }

  return grouped;
}
