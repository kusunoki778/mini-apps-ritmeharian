import type { Alarm } from '@/lib/db/db';

export type RepeatMode = 'once' | 'daily' | 'custom';

// Urutan tampilan Senin sampai Minggu, sedangkan nilai hari mengikuti Date.getDay.
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const DAY_LABELS: Record<number, string> = {
  1: 'Sen',
  2: 'Sel',
  3: 'Rab',
  4: 'Kam',
  5: 'Jum',
  6: 'Sab',
  0: 'Min',
};

export const MISS_WINDOW_MS = 60_000;

export function allDays(): number[] {
  return [0, 1, 2, 3, 4, 5, 6];
}

export function isOnce(days: number[]): boolean {
  return days.length === 0;
}

export function repeatModeFromDays(days: number[]): RepeatMode {
  if (days.length === 0) return 'once';
  if (days.length === 7) return 'daily';
  return 'custom';
}

export function formatAlarmTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}.${String(minute).padStart(2, '0')}`;
}

export function parseTimeInput(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

export function sortDays(days: number[]): number[] {
  const unique = [...new Set(days)];
  return DAY_ORDER.filter((day) => unique.includes(day));
}

export function formatRepeat(alarm: Pick<Alarm, 'days'>): string {
  if (alarm.days.length === 0) return 'Sekali';
  if (alarm.days.length === 7) return 'Setiap hari';

  return sortDays(alarm.days)
    .map((day) => DAY_LABELS[day])
    .join(', ');
}

// Kandidat waktu lokal pada offset hari tertentu. Dibangun dari komponen tanggal lokal
// supaya pergantian hari dan DST tidak menggeser jam dinding (bukan penambahan 24 jam).
function candidateAt(now: Date, hour: number, minute: number, dayOffset: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minute, 0, 0);
}

export function nextTrigger(alarm: Alarm, now: Date): number | null {
  if (!alarm.enabled) return null;

  const once = isOnce(alarm.days);

  for (let offset = 0; offset <= 7; offset += 1) {
    const at = candidateAt(now, alarm.hour, alarm.minute, offset);
    if (at.getTime() <= now.getTime()) continue;
    if (once || alarm.days.includes(at.getDay())) return at.getTime();
  }

  return null;
}

export function previousTrigger(alarm: Alarm, now: Date): number | null {
  const once = isOnce(alarm.days);
  const maxOffset = once ? 0 : 7;

  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const at = candidateAt(now, alarm.hour, alarm.minute, -offset);
    if (at.getTime() > now.getTime()) continue;
    if (once || alarm.days.includes(at.getDay())) return at.getTime();
  }

  return null;
}

export type AlarmDecision =
  { type: 'idle' } | { type: 'ring'; at: number } | { type: 'missed'; at: number };

// Menentukan apakah alarm perlu berbunyi sekarang. Terlewat lebih dari 60 detik tidak
// dibunyikan, hanya ditandai agar tidak berbunyi berulang.
export function decideAlarm(alarm: Alarm, now: Date): AlarmDecision {
  if (!alarm.enabled) return { type: 'idle' };

  const previous = previousTrigger(alarm, now);
  if (previous === null) return { type: 'idle' };
  // Kemunculan sebelum alarm dibuat bukan jadwal yang terlewat.
  if (alarm.createdAt !== undefined && previous < alarm.createdAt) return { type: 'idle' };
  if (alarm.lastTriggeredAt === previous) return { type: 'idle' };

  return now.getTime() - previous <= MISS_WINDOW_MS
    ? { type: 'ring', at: previous }
    : { type: 'missed', at: previous };
}

export function formatCountdown(timestamp: number, now: Date): string {
  const target = new Date(timestamp);
  const time = formatAlarmTime(target.getHours(), target.getMinutes());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((targetDay - today) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return `Hari ini, ${time}`;
  if (diffDays === 1) return `Besok, ${time}`;

  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(target);
  return `${dayName}, ${time}`;
}
