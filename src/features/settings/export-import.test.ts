import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/db';
import { buildExport, clearAllData, importFromText } from './export-import';
import { DEFAULT_SETTINGS } from './settings';
import { writeSettings } from './settings-repo';

describe('ekspor dan impor', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it('melakukan roundtrip utuh', async () => {
    await db.notes.add({
      id: 'n1',
      title: 'Catatan',
      body: 'isi',
      pinned: 1,
      createdAt: 1,
      updatedAt: 2,
    });
    await db.events.add({
      id: 'e1',
      title: 'Rapat',
      start: 1000,
      end: 2000,
      allDay: false,
      createdAt: 1,
      updatedAt: 2,
    });
    await db.alarms.add({
      id: 'a1',
      label: 'Bangun',
      hour: 6,
      minute: 30,
      days: [1, 2, 3, 4, 5],
      enabled: true,
      snoozeMinutes: 5,
    });
    await writeSettings({ ...DEFAULT_SETTINGS, clockFormat: '12h' });

    const exported = await buildExport();

    await clearAllData();
    const summary = await importFromText(JSON.stringify(exported));

    expect(summary).toEqual({ notes: 1, events: 1, alarms: 1 });
    expect((await db.notes.get('n1'))?.title).toBe('Catatan');
    expect((await db.alarms.get('a1'))?.days).toEqual([1, 2, 3, 4, 5]);
  });

  it('menolak berkas yang bukan JSON', async () => {
    await expect(importFromText('{bukan json')).rejects.toThrow('JSON');
  });

  it('menolak versi yang tidak didukung', async () => {
    const exported = await buildExport();
    await expect(importFromText(JSON.stringify({ ...exported, version: 99 }))).rejects.toThrow(
      'tidak didukung',
    );
  });

  it('menolak struktur data yang tidak lengkap', async () => {
    await expect(importFromText(JSON.stringify({ app: 'nadi', version: 1 }))).rejects.toThrow(
      'tidak dikenali',
    );
  });
});
