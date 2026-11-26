import { db, type Alarm } from '@/lib/db/db';
import { createId } from '@/lib/utils/id';
import { allDays, parseTimeInput, sortDays, type RepeatMode } from './alarm-utils';

export const SNOOZE_OPTIONS = [1, 5, 10, 15, 30] as const;
export const DEFAULT_SNOOZE_MINUTES = 5;

export interface AlarmInput {
  label: string;
  time: string;
  repeat: RepeatMode;
  days: number[];
  snoozeMinutes: number;
  enabled: boolean;
}

interface AlarmFields {
  label: string;
  hour: number;
  minute: number;
  days: number[];
  enabled: boolean;
  snoozeMinutes: number;
}

export function buildAlarmFields(input: AlarmInput): AlarmFields {
  const parsed = parseTimeInput(input.time) ?? { hour: 0, minute: 0 };

  return {
    label: input.label.trim() || 'Alarm',
    hour: parsed.hour,
    minute: parsed.minute,
    days:
      input.repeat === 'once' ? [] : input.repeat === 'daily' ? allDays() : sortDays(input.days),
    enabled: input.enabled,
    snoozeMinutes: input.snoozeMinutes,
  };
}

// Diurutkan menaik berdasarkan jam, lalu label.
export function sortAlarms(alarms: Alarm[]): Alarm[] {
  return [...alarms].sort((a, b) => {
    const aMinutes = a.hour * 60 + a.minute;
    const bMinutes = b.hour * 60 + b.minute;
    if (aMinutes !== bMinutes) return aMinutes - bMinutes;
    return a.label.localeCompare(b.label, 'id-ID');
  });
}

export async function listAlarms(): Promise<Alarm[]> {
  return sortAlarms(await db.alarms.toArray());
}

export async function createAlarm(input: AlarmInput): Promise<string> {
  const id = createId();

  await db.alarms.add({ id, ...buildAlarmFields(input), createdAt: Date.now() });

  return id;
}

export async function updateAlarm(id: string, input: AlarmInput): Promise<void> {
  await db.alarms.update(id, { ...buildAlarmFields(input) });
}

export async function setAlarmEnabled(id: string, enabled: boolean): Promise<void> {
  await db.alarms.update(id, { enabled });
}

// Menandai waktu pemicu terakhir. Alarm sekali pakai otomatis nonaktif setelah berbunyi.
export async function markTriggered(id: string, at: number, disable: boolean): Promise<void> {
  await db.alarms.update(
    id,
    disable ? { lastTriggeredAt: at, enabled: false } : { lastTriggeredAt: at },
  );
}

export async function deleteAlarm(id: string): Promise<void> {
  await db.alarms.delete(id);
}
