import { describe, expect, it } from 'vitest';

import type { Alarm } from '@/lib/db/db';
import {
  ALARM_CHANNEL_ID,
  ALARM_EXTRA_KIND,
  buildNativeNotifications,
  notificationId,
  OCCURRENCES_PER_ALARM,
  upcomingOccurrences,
} from './alarm-scheduler';

function makeAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: 'alarm-1',
    label: 'Bangun pagi',
    hour: 7,
    minute: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    snoozeMinutes: 5,
    ...overrides,
  };
}

const FROM = new Date(2026, 0, 15, 6, 0, 0);

describe('notificationId', () => {
  it('deterministik untuk kunci yang sama', () => {
    expect(notificationId('alarm-1:1000')).toBe(notificationId('alarm-1:1000'));
  });

  it('selalu bilangan bulat 32 bit positif', () => {
    const id = notificationId('alarm-abc:1768000000000');
    expect(Number.isInteger(id)).toBe(true);
    expect(id).toBeGreaterThan(0);
    expect(id).toBeLessThanOrEqual(2147483647);
  });
});

describe('upcomingOccurrences', () => {
  it('mengumpulkan kemunculan harian berurutan', () => {
    const occurrences = upcomingOccurrences(makeAlarm(), FROM, 3);
    expect(occurrences).toHaveLength(3);
    expect(new Date(occurrences[0]).getHours()).toBe(7);
    expect(new Date(occurrences[0]).getDate()).toBe(15);
    expect(new Date(occurrences[1]).getDate()).toBe(16);
    expect(new Date(occurrences[2]).getDate()).toBe(17);
  });

  it('menghormati jumlah maksimum', () => {
    expect(upcomingOccurrences(makeAlarm(), FROM, OCCURRENCES_PER_ALARM)).toHaveLength(
      OCCURRENCES_PER_ALARM,
    );
  });

  it('kosong untuk alarm nonaktif', () => {
    expect(upcomingOccurrences(makeAlarm({ enabled: false }), FROM, 7)).toEqual([]);
  });

  it('satu kemunculan untuk alarm sekali pakai', () => {
    expect(upcomingOccurrences(makeAlarm({ days: [] }), FROM, 7)).toHaveLength(1);
  });
});

describe('buildNativeNotifications', () => {
  it('membuat satu notifikasi per kemunculan dengan kanal dan penanda', () => {
    const notifications = buildNativeNotifications([makeAlarm()], FROM);
    expect(notifications).toHaveLength(OCCURRENCES_PER_ALARM);

    const first = notifications[0];
    expect(first.channelId).toBe(ALARM_CHANNEL_ID);
    expect(first.title).toBe('Bangun pagi');
    expect(first.body).toContain('07.00');
    expect(first.isExactNotification).toBe(true);
    expect(first.schedule?.allowWhileIdle).toBe(true);
    expect(first.extra?.kind).toBe(ALARM_EXTRA_KIND);
    expect(first.extra?.alarmId).toBe('alarm-1');
  });

  it('melewati alarm nonaktif', () => {
    expect(buildNativeNotifications([makeAlarm({ enabled: false })], FROM)).toEqual([]);
  });

  it('id antar kemunculan berbeda', () => {
    const notifications = buildNativeNotifications([makeAlarm()], FROM);
    const ids = new Set(notifications.map((item) => item.id));
    expect(ids.size).toBe(notifications.length);
  });
});
