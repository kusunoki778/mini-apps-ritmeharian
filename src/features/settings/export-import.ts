import { z } from 'zod';

import { db } from '@/lib/db/db';
import {
  LOCATION_STORAGE_KEY,
  readLocation,
  writeLocation,
} from '@/features/location/location-storage';
import { THEME_STORAGE_KEY } from './theme';
import { DEFAULT_SETTINGS } from './settings';
import { readSettings, writeSettings } from './settings-repo';
import { WEEK_START_STORAGE_KEY } from './week-start';

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

const noteSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  body: z.string(),
  pinned: z.union([z.literal(0), z.literal(1)]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  start: z.number(),
  end: z.number().nullable(),
  allDay: z.boolean(),
  note: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const alarmSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  days: z.array(z.number().int().min(0).max(6)),
  enabled: z.boolean(),
  snoozeMinutes: z.number().int().min(0),
  lastTriggeredAt: z.number().optional(),
  createdAt: z.number().optional(),
});

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  temperatureUnit: z.enum(['celsius', 'fahrenheit']),
  clockFormat: z.enum(['24h', '12h']),
  weekStart: z.union([z.literal(0), z.literal(1)]),
});

const locationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  admin1: z.string().optional(),
  country: z.string().optional(),
  source: z.enum(['geolocation', 'search', 'default']),
});

const exportSchema = z.object({
  app: z.literal('nadi'),
  version: z.literal(1),
  exportedAt: z.string(),
  settings: settingsSchema,
  location: locationSchema,
  notes: z.array(noteSchema),
  events: z.array(eventSchema),
  alarms: z.array(alarmSchema),
});

export type NadiExport = z.infer<typeof exportSchema>;

export interface ImportSummary {
  notes: number;
  events: number;
  alarms: number;
}

export async function buildExport(): Promise<NadiExport> {
  const [notes, events, alarms, stored] = await Promise.all([
    db.notes.toArray(),
    db.events.toArray(),
    db.alarms.toArray(),
    readSettings(),
  ]);

  return {
    app: 'nadi',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS, ...stored },
    location: readLocation(),
    notes,
    events,
    alarms,
  };
}

export function exportFilename(now: Date = new Date()): string {
  return `nadi-${now.toISOString().slice(0, 10)}.json`;
}

export function downloadExport(data: NadiExport, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function importFromText(text: string): Promise<ImportSummary> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Berkas bukan JSON yang valid.');
  }

  const result = exportSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Struktur data tidak dikenali atau versinya tidak didukung.');
  }

  const data = result.data;

  await db.transaction('rw', db.notes, db.events, db.alarms, db.settings, async () => {
    await Promise.all([db.notes.clear(), db.events.clear(), db.alarms.clear()]);
    await db.notes.bulkAdd(data.notes);
    await db.events.bulkAdd(data.events);
    await db.alarms.bulkAdd(data.alarms);
    await writeSettings(data.settings);
  });

  writeLocation(data.location);

  return { notes: data.notes.length, events: data.events.length, alarms: data.alarms.length };
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.notes, db.events, db.alarms, db.settings, db.cache, async () => {
    await Promise.all([
      db.notes.clear(),
      db.events.clear(),
      db.alarms.clear(),
      db.settings.clear(),
      db.cache.clear(),
    ]);
  });
}

export function clearLocalPreferences(): void {
  try {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    window.localStorage.removeItem(WEEK_START_STORAGE_KEY);
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // Penyimpanan bisa diblokir. Tidak ada yang perlu dibersihkan.
  }
}
