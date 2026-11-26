import { describe, expect, it } from 'vitest';

import type { Alarm, CalendarEvent } from '@/lib/db/db';
import {
  ALARM_CHANNEL_ID,
  ALARM_EXTRA_KIND,
  buildNativeAlarms,
  buildNativeEventItems,
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

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'event-1',
    title: 'Rapat',
    start: new Date(2026, 0, 15, 9, 0, 0).getTime(),
    end: null,
    allDay: false,
    reminderMinutes: 0,
    reminderSoundId: 'nadi',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

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

describe('buildNativeAlarms', () => {
  it('membuat satu item per kemunculan dengan penanda alarm', () => {
    const alarms = buildNativeAlarms([makeAlarm()], FROM);
    expect(alarms).toHaveLength(OCCURRENCES_PER_ALARM);

    const first = alarms[0];
    expect(first.label).toBe('Bangun pagi');
    expect(first.alarmId).toBe('alarm-1');
    expect(first.snoozeMinutes).toBe(5);
    expect(first.soundId).toBe('nadi');
    expect(new Date(first.at).getHours()).toBe(7);
  });

  it('menyalin pilihan nada ke tiap kemunculan', () => {
    const alarms = buildNativeAlarms([makeAlarm()], FROM, 'lonceng');
    expect(alarms.every((item) => item.soundId === 'lonceng')).toBe(true);
  });

  it('melewati alarm nonaktif', () => {
    expect(buildNativeAlarms([makeAlarm({ enabled: false })], FROM)).toEqual([]);
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

describe('buildNativeEventItems', () => {
  it('membuat satu item tepat di waktu agenda', () => {
    const items = buildNativeEventItems([makeEvent()], FROM);
    expect(items).toHaveLength(1);
    expect(new Date(items[0].at).getHours()).toBe(9);
    expect(items[0].label).toBe('Rapat');
    expect(items[0].alarmId).toBe('event:event-1');
  });

  it('memajukan waktu sesuai menit pengingat', () => {
    const items = buildNativeEventItems([makeEvent({ reminderMinutes: 15 })], FROM);
    expect(new Date(items[0].at).getHours()).toBe(8);
    expect(new Date(items[0].at).getMinutes()).toBe(45);
  });

  it('melewati agenda tanpa pengingat', () => {
    expect(buildNativeEventItems([makeEvent({ reminderMinutes: null })], FROM)).toEqual([]);
  });

  it('melewati agenda yang pengingatnya sudah lewat', () => {
    const past = new Date(2026, 0, 15, 5, 0, 0).getTime();
    expect(buildNativeEventItems([makeEvent({ start: past })], FROM)).toEqual([]);
  });

  it('menyalin pilihan nada ke item agenda', () => {
    const items = buildNativeEventItems([makeEvent()], FROM, 'fajar');
    expect(items[0].soundId).toBe('fajar');
  });

  it('memberi label cadangan untuk agenda tanpa judul', () => {
    const items = buildNativeEventItems([makeEvent({ title: '' })], FROM);
    expect(items[0].label).toBe('Agenda');
  });
});
