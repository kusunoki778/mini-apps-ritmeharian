import { beforeEach, describe, expect, it, vi } from 'vitest';

const holder = vi.hoisted(() => ({
  alarms: [] as Array<{ id: string; days: number[] }>,
  fired: [] as Array<{ id: string; at: number }>,
  triggered: [] as Array<{ id: string; at: number; disable: boolean }>,
}));

vi.mock('@/lib/db/db', () => ({
  db: {
    alarms: {
      get: async (id: string) => holder.alarms.find((alarm) => alarm.id === id),
    },
  },
}));

vi.mock('@/features/calendar/events-repo', () => ({
  markReminderFired: async (id: string, at: number) => {
    holder.fired.push({ id, at });
  },
}));

vi.mock('./alarms-repo', () => ({
  markTriggered: async (id: string, at: number, disable: boolean) => {
    holder.triggered.push({ id, at, disable });
  },
}));

import { applyNativeStops } from './native-stops';

beforeEach(() => {
  holder.alarms = [];
  holder.fired = [];
  holder.triggered = [];
});

describe('applyNativeStops', () => {
  it('menonaktifkan alarm sekali pakai setelah berbunyi', async () => {
    holder.alarms = [{ id: 'a', days: [] }];

    await applyNativeStops([{ alarmId: 'a', at: 1000 }]);

    expect(holder.triggered).toEqual([{ id: 'a', at: 1000, disable: true }]);
  });

  it('membiarkan alarm berulang tetap aktif', async () => {
    holder.alarms = [{ id: 'a', days: [1, 2] }];

    await applyNativeStops([{ alarmId: 'a', at: 1000 }]);

    expect(holder.triggered).toEqual([{ id: 'a', at: 1000, disable: false }]);
  });

  it('menandai pengingat agenda yang berbunyi', async () => {
    await applyNativeStops([{ alarmId: 'event:e1', at: 2000 }]);

    expect(holder.fired).toEqual([{ id: 'e1', at: 2000 }]);
    expect(holder.triggered).toEqual([]);
  });

  it('melewati timer dan alarm yang sudah dihapus', async () => {
    await applyNativeStops([
      { alarmId: 'timer', at: 1000 },
      { alarmId: 'hilang', at: 1000 },
      { alarmId: '', at: 1000 },
      { alarmId: 'a', at: 0 },
    ]);

    expect(holder.triggered).toEqual([]);
  });
});
