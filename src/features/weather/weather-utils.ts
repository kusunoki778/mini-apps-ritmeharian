import { getClockFormat, type ClockFormat } from '@/lib/format/preferences';
import { formatClockParts, formatTimeOfDay } from '@/lib/format/time';
import { currentHourIndex } from '@/lib/utils/hour-series';

const TIME_PATTERN = /T(\d{2}):(\d{2})/;

export { currentHourIndex };

export function formatClock(iso: string, format: ClockFormat = getClockFormat()): string {
  const match = TIME_PATTERN.exec(iso);
  if (!match) return iso;

  return formatClockParts(Number(match[1]), Number(match[2]), format);
}

export function formatUpdatedAt(timestamp: number): string {
  return `Diperbarui ${formatTimeOfDay(new Date(timestamp))}`;
}

export function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(iso));
}

export function formatDayShort(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(iso));
}

export function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function hourIsDaylight(timeIso: string, sunrise: string[], sunset: string[]): boolean {
  const date = timeIso.slice(0, 10);
  const index = sunrise.findIndex((value) => value.slice(0, 10) === date);
  if (index === -1 || !sunrise[index] || !sunset[index]) return true;

  return timeIso >= sunrise[index] && timeIso < sunset[index];
}
