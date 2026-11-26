import { formatTimeOfDay } from '@/lib/format/time';

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function daysBetween(a: Date, b: Date): number {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(a) - startOfDay(b)) / day);
}

export function formatNoteTime(timestamp: number, now: Date = new Date()): string {
  const date = new Date(timestamp);
  const diff = daysBetween(now, date);

  if (diff === 0) return `Hari ini, ${formatTimeOfDay(date)}`;
  if (diff === 1) return `Kemarin, ${formatTimeOfDay(date)}`;
  if (diff === -1) return `Besok, ${formatTimeOfDay(date)}`;

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
