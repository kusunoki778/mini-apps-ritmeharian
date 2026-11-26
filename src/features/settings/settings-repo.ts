import { db } from '@/lib/db/db';
import { sanitizeSettings, type Settings } from './settings';

const SETTINGS_KEY = 'app';

export async function readSettings(): Promise<Partial<Settings>> {
  const row = await db.settings.get(SETTINGS_KEY);
  return sanitizeSettings(row?.value);
}

export async function writeSettings(settings: Settings): Promise<void> {
  await db.settings.put({ key: SETTINGS_KEY, value: settings });
}

export async function clearSettings(): Promise<void> {
  await db.settings.delete(SETTINGS_KEY);
}
