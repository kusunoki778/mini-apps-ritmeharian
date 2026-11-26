import { Capacitor } from '@capacitor/core';
import type { LocalNotificationSchema } from '@capacitor/local-notifications';

import type { Alarm, CalendarEvent } from '@/lib/db/db';
import { formatAlarmTime, isOnce, nextTrigger } from './alarm-utils';
import { DEFAULT_ALARM_SOUND, isAlarmSoundId, type AlarmSoundId } from './alarm-sounds';
import { fullAlarm, fullAlarmSupported, type NativeAlarmItem } from './native-alarm';

export const ALARM_CHANNEL_ID = 'nadi-alarm';
export const ALARM_SOUND = 'alarm.wav';
export const ALARM_EXTRA_KIND = 'nadi-alarm';

// AlarmManager hanya bisa menjadwalkan satu waktu pasti per notifikasi, jadi sebuah
// alarm berulang dijadwalkan sebagai beberapa kemunculan berikutnya sekaligus, lalu
// diselaraskan ulang setiap aplikasi dibuka dan setiap daftar alarm berubah.
export const OCCURRENCES_PER_ALARM = 7;

export function nativeAlarmsSupported(): boolean {
  return Capacitor.isNativePlatform();
}

// Id notifikasi Android harus bilangan bulat 32 bit. Turunkan secara deterministik
// dari kunci stabil agar alarm yang sama tidak menumpuk.
export function notificationId(key: string): number {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }
  const positive = Math.abs(hash);
  return positive === 0 ? 1 : positive;
}

// Kumpulkan beberapa kemunculan berikutnya dari sebuah alarm, untuk dijadwalkan
// sebagai alarm pasti satu per satu.
export function upcomingOccurrences(alarm: Alarm, from: Date, count: number): number[] {
  if (!alarm.enabled) return [];

  // Alarm sekali pakai hanya punya satu kemunculan.
  const limit = isOnce(alarm.days) ? 1 : count;
  const occurrences: number[] = [];
  let cursor = from;

  for (let index = 0; index < limit; index += 1) {
    const at = nextTrigger(alarm, cursor);
    if (at === null) break;
    occurrences.push(at);
    cursor = new Date(at + 1000);
  }

  return occurrences;
}

// Kumpulkan kemunculan berikutnya sebagai item alarm native. Murni supaya bisa
// diuji tanpa runtime native. Nada diambil dari alarm bila ada, jika tidak dari
// pilihan global di pengaturan.
export function buildNativeAlarms(
  alarms: Alarm[],
  from: Date,
  soundId: AlarmSoundId = DEFAULT_ALARM_SOUND,
): NativeAlarmItem[] {
  const items: NativeAlarmItem[] = [];

  for (const alarm of alarms) {
    const alarmSound = isAlarmSoundId(alarm.soundId) ? alarm.soundId : soundId;

    for (const at of upcomingOccurrences(alarm, from, OCCURRENCES_PER_ALARM)) {
      items.push({
        id: notificationId(`${alarm.id}:${at}`),
        at,
        label: alarm.label || 'Alarm',
        alarmId: alarm.id,
        snoozeMinutes: alarm.snoozeMinutes,
        soundId: alarmSound,
      });
    }
  }

  return items;
}

// Kumpulkan pengingat agenda sebagai item alarm native. Agenda bersifat sekali
// jalan (bukan harian), jadi satu item per agenda yang punya nada dering.
export function buildNativeEventItems(
  events: CalendarEvent[],
  from: Date,
  soundId: AlarmSoundId = DEFAULT_ALARM_SOUND,
): NativeAlarmItem[] {
  const items: NativeAlarmItem[] = [];
  const fromMs = from.getTime();

  for (const event of events) {
    if (event.reminderMinutes == null) continue;
    const at = event.start - event.reminderMinutes * 60_000;
    if (at <= fromMs) continue;

    items.push({
      id: notificationId(`event:${event.id}:${at}`),
      at,
      label: event.title || 'Agenda',
      alarmId: `event:${event.id}`,
      snoozeMinutes: 5,
      soundId,
    });
  }

  return items;
}

// Bangun daftar notifikasi native untuk seluruh alarm. Murni supaya bisa diuji
// tanpa runtime native.
export function buildNativeNotifications(alarms: Alarm[], from: Date): LocalNotificationSchema[] {
  return buildNativeAlarms(alarms, from).map((item) => {
    const at = new Date(item.at);
    return {
      id: item.id,
      title: item.label,
      body: `Alarm ${formatAlarmTime(at.getHours(), at.getMinutes())}`,
      channelId: ALARM_CHANNEL_ID,
      isExactNotification: true,
      extra: { kind: ALARM_EXTRA_KIND, alarmId: item.alarmId, at: item.at },
      schedule: { at, allowWhileIdle: true },
    };
  });
}

async function plugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

export async function ensureAlarmChannel(): Promise<void> {
  const LocalNotifications = await plugin();
  await LocalNotifications.createChannel({
    id: ALARM_CHANNEL_ID,
    name: 'Alarm',
    description: 'Alarm Nadi yang berbunyi tepat waktu.',
    importance: 5,
    sound: ALARM_SOUND,
    vibration: true,
    visibility: 1,
  });
}

// Selaraskan alarm native dengan daftar saat ini. Dipanggil saat boot dan setiap
// daftar alarm, agenda, atau pilihan nada berubah. Mengembalikan jumlah kemunculan.
export async function syncNativeAlarms(
  alarms: Alarm[],
  from: Date = new Date(),
  soundId: AlarmSoundId = DEFAULT_ALARM_SOUND,
  events: CalendarEvent[] = [],
): Promise<number> {
  if (!nativeAlarmsSupported()) return 0;

  const items = [
    ...buildNativeAlarms(alarms, from, soundId),
    ...buildNativeEventItems(events, from, soundId),
  ];

  // Tier 2: plugin native dengan alarm layar penuh, bunyi berulang, dan tombol tunda.
  if (fullAlarmSupported()) {
    const bridge = fullAlarm();
    await bridge.cancelAll();
    if (items.length > 0) await bridge.schedule({ alarms: items });
    return items.length;
  }

  // Tier 1: notifikasi lokal pasti dari @capacitor/local-notifications.
  const LocalNotifications = await plugin();
  await ensureAlarmChannel();

  const pending = await LocalNotifications.getPending();
  const stale = pending.notifications.filter((item) => item.extra?.kind === ALARM_EXTRA_KIND);
  if (stale.length > 0) {
    await LocalNotifications.cancel({
      notifications: stale.map((item) => ({ id: item.id })),
    });
  }

  const notifications = buildNativeNotifications(alarms, from);
  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }

  return notifications.length;
}
