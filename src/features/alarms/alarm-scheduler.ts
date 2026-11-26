import { Capacitor } from '@capacitor/core';
import type { LocalNotificationSchema } from '@capacitor/local-notifications';

import type { Alarm } from '@/lib/db/db';
import { formatAlarmTime, isOnce, nextTrigger } from './alarm-utils';

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

// Bangun daftar notifikasi native untuk seluruh alarm. Murni supaya bisa diuji
// tanpa runtime native.
export function buildNativeNotifications(alarms: Alarm[], from: Date): LocalNotificationSchema[] {
  const notifications: LocalNotificationSchema[] = [];

  for (const alarm of alarms) {
    for (const at of upcomingOccurrences(alarm, from, OCCURRENCES_PER_ALARM)) {
      notifications.push({
        id: notificationId(`${alarm.id}:${at}`),
        title: alarm.label || 'Alarm',
        body: `Alarm ${formatAlarmTime(alarm.hour, alarm.minute)}`,
        channelId: ALARM_CHANNEL_ID,
        isExactNotification: true,
        extra: { kind: ALARM_EXTRA_KIND, alarmId: alarm.id, at },
        schedule: { at: new Date(at), allowWhileIdle: true },
      });
    }
  }

  return notifications;
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

export type NativeAlarmPermission = 'granted' | 'denied' | 'unsupported';

export async function requestNativeAlarmPermissions(): Promise<NativeAlarmPermission> {
  if (!nativeAlarmsSupported()) return 'unsupported';

  const LocalNotifications = await plugin();
  const status = await LocalNotifications.requestPermissions();
  if (status.display !== 'granted') return 'denied';

  const exact = await LocalNotifications.checkExactNotificationSetting();
  if (exact.exact_alarm !== 'granted') {
    await LocalNotifications.changeExactNotificationSetting();
  }

  return 'granted';
}

// Selaraskan notifikasi native dengan daftar alarm saat ini. Dipanggil saat boot dan
// setiap daftar alarm berubah. Mengembalikan jumlah notifikasi yang dijadwalkan.
export async function syncNativeAlarms(alarms: Alarm[], from: Date = new Date()): Promise<number> {
  if (!nativeAlarmsSupported()) return 0;

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
