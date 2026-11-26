import Dexie, { type Table } from 'dexie';

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: 0 | 1;
  createdAt: number;
  updatedAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: number;
  end: number | null;
  allDay: boolean;
  note?: string;
  // Pengingat agenda. reminderMinutes = menit sebelum mulai (0 = tepat saat mulai).
  // Tidak ada nilai berarti agenda tidak berbunyi.
  reminderMinutes?: number | null;
  reminderSoundId?: string;
  reminderFiredAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  days: number[];
  enabled: boolean;
  snoozeMinutes: number;
  lastTriggeredAt?: number;
  createdAt?: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}

export interface CacheEntry<T> {
  key: string;
  fetchedAt: number;
  payload: T;
}

class NadiDatabase extends Dexie {
  notes!: Table<Note, string>;
  events!: Table<CalendarEvent, string>;
  alarms!: Table<Alarm, string>;
  settings!: Table<SettingRow, string>;
  cache!: Table<CacheEntry<unknown>, string>;

  constructor() {
    super('nadi');
    this.version(1).stores({
      notes: 'id, pinned, updatedAt',
      events: 'id, start',
      alarms: 'id, enabled',
      settings: 'key',
      cache: 'key',
    });
  }
}

export const db = new NadiDatabase();
