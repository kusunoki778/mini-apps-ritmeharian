import { beforeEach, describe, expect, it } from 'vitest';

import { db, type Alarm } from '@/lib/db/db';
import { DEFAULT_ALARM_SOUND, type AlarmSoundId } from './alarm-sounds';
import {
  buildAlarmFields,
  createAlarm,
  deleteAlarm,
  listAlarms,
  markTriggered,
  setAlarmEnabled,
  sortAlarms,
  updateAlarm,
  type AlarmInput,
} from './alarms-repo';

function input(overrides: Partial<AlarmInput> = {}): AlarmInput {
  return {
    label: 'Bangun',
    time: '07:30',
    repeat: 'once',
    days: [],
    snoozeMinutes: 5,
    enabled: true,
    soundId: DEFAULT_ALARM_SOUND,
    ...overrides,
  };
}

describe('buildAlarmFields', () => {
  it('mengurai waktu menjadi jam dan menit', () => {
    const fields = buildAlarmFields(input({ time: '05:07' }));

    expect(fields.hour).toBe(5);
    expect(fields.minute).toBe(7);
  });

  it('menerjemahkan mode ulangi ke daftar hari', () => {
    expect(buildAlarmFields(input({ repeat: 'once' })).days).toEqual([]);
    expect(buildAlarmFields(input({ repeat: 'daily' })).days).toHaveLength(7);
    expect(buildAlarmFields(input({ repeat: 'custom', days: [3, 1] })).days).toEqual([1, 3]);
  });

  it('memberi label bawaan dan memangkas spasi', () => {
    expect(buildAlarmFields(input({ label: '   ' })).label).toBe('Alarm');
    expect(buildAlarmFields(input({ label: '  Bangun  ' })).label).toBe('Bangun');
  });

  it('menyimpan nada dering dan jatuh ke nada bawaan bila tidak dikenal', () => {
    expect(buildAlarmFields(input({ soundId: 'lonceng' })).soundId).toBe('lonceng');
    expect(
      buildAlarmFields(input({ soundId: 'tidak-ada' as unknown as AlarmSoundId })).soundId,
    ).toBe(DEFAULT_ALARM_SOUND);
  });
});

describe('sortAlarms', () => {
  it('mengurutkan menaik berdasarkan jam lalu label', () => {
    const base: Alarm = {
      id: 'x',
      label: 'x',
      hour: 0,
      minute: 0,
      days: [],
      enabled: true,
      snoozeMinutes: 5,
    };
    const alarms: Alarm[] = [
      { ...base, id: 'b', label: 'B', hour: 9, minute: 0 },
      { ...base, id: 'a', label: 'A', hour: 7, minute: 30 },
      { ...base, id: 'c', label: 'A', hour: 7, minute: 15 },
    ];

    expect(sortAlarms(alarms).map((alarm) => alarm.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('repositori alarms', () => {
  beforeEach(async () => {
    await db.alarms.clear();
  });

  it('membuat, membaca, memperbarui, dan menghapus', async () => {
    const id = await createAlarm(input({ label: 'Bangun', time: '06:15' }));
    const created = await db.alarms.get(id);

    expect(created?.label).toBe('Bangun');
    expect(created?.hour).toBe(6);
    expect(created?.minute).toBe(15);
    expect(created?.enabled).toBe(true);
    expect(typeof created?.createdAt).toBe('number');

    await updateAlarm(id, input({ label: 'Olahraga', time: '18:45', repeat: 'daily' }));
    const updated = await db.alarms.get(id);

    expect(updated?.label).toBe('Olahraga');
    expect(updated?.minute).toBe(45);
    expect(updated?.days).toHaveLength(7);

    await deleteAlarm(id);
    expect(await db.alarms.get(id)).toBeUndefined();
  });

  it('menyalakan dan mematikan alarm', async () => {
    const id = await createAlarm(input());
    await setAlarmEnabled(id, false);

    expect((await db.alarms.get(id))?.enabled).toBe(false);
  });

  it('menandai pemicu dan menonaktifkan alarm sekali pakai', async () => {
    const id = await createAlarm(input({ repeat: 'once' }));
    await markTriggered(id, 1000, true);

    const alarm = await db.alarms.get(id);
    expect(alarm?.lastTriggeredAt).toBe(1000);
    expect(alarm?.enabled).toBe(false);
  });

  it('mengembalikan daftar terurut', async () => {
    await createAlarm(input({ label: 'Siang', time: '12:00' }));
    await createAlarm(input({ label: 'Pagi', time: '05:00' }));

    const alarms = await listAlarms();
    expect(alarms.map((alarm) => alarm.label)).toEqual(['Pagi', 'Siang']);
  });
});
