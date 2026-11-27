import { Capacitor, registerPlugin } from '@capacitor/core';

import type { AlarmSoundId } from './alarm-sounds';

// Satu kemunculan alarm yang dijadwalkan ke AlarmManager lewat plugin native.
export interface NativeAlarmItem {
  id: number;
  at: number;
  label: string;
  alarmId: string;
  snoozeMinutes: number;
  soundId: AlarmSoundId;
}

// Alarm yang sedang berbunyi di layanan latar depan. Dipakai lapisan web supaya
// selalu ada tombol Matikan, termasuk saat notifikasi atau layar penuh diblokir.
export interface NativeRinging {
  notificationId: number;
  at: number;
  label: string;
  alarmId: string;
  snoozeMinutes: number;
}

// Catatan alarm yang sudah berhenti di luar aplikasi.
export interface NativeAlarmStop {
  alarmId: string;
  at: number;
}

interface NativeAlarmBridge {
  schedule(options: { alarms: NativeAlarmItem[] }): Promise<void>;
  cancel(options: { id: number }): Promise<void>;
  cancelAll(): Promise<void>;
  canScheduleExactAlarms(): Promise<{ granted: boolean }>;
  canUseFullScreenIntent(): Promise<{ granted: boolean }>;
  openFullScreenIntentSettings(): Promise<void>;
  scheduleTimer(options: { at: number; label?: string; soundId?: string }): Promise<void>;
  cancelTimer(): Promise<void>;
  getRinging(): Promise<{ ringing: NativeRinging | null }>;
  stopRinging(options: { snoozed: boolean }): Promise<void>;
  snoozeRinging(): Promise<void>;
  consumeStops(): Promise<{ stops: NativeAlarmStop[] }>;
}

const NativeAlarm = registerPlugin<NativeAlarmBridge>('NativeAlarm');

// Benar hanya di pembungkus native yang menyertakan plugin alarm layar penuh.
export function fullAlarmSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('NativeAlarm');
}

export function fullAlarm() {
  return NativeAlarm;
}

export async function scheduleNativeTimer(
  triggerAt: number,
  label = 'Timer',
  soundId = 'nadi',
): Promise<void> {
  if (!fullAlarmSupported()) return;
  await NativeAlarm.scheduleTimer({ at: triggerAt, label, soundId });
}

export async function cancelNativeTimer(): Promise<void> {
  if (!fullAlarmSupported()) return;
  await NativeAlarm.cancelTimer();
}

export async function getNativeRinging(): Promise<NativeRinging | null> {
  if (!fullAlarmSupported()) return null;
  try {
    const { ringing } = await NativeAlarm.getRinging();
    return ringing ?? null;
  } catch {
    return null;
  }
}

export async function stopNativeRinging(snoozed = false): Promise<void> {
  if (!fullAlarmSupported()) return;
  await NativeAlarm.stopRinging({ snoozed });
}

// Tunda dari dalam aplikasi. Nada dan jadwal berikutnya diurus lapisan Android.
export async function snoozeNativeRinging(): Promise<void> {
  if (!fullAlarmSupported()) return;
  await NativeAlarm.snoozeRinging();
}

export async function consumeNativeStops(): Promise<NativeAlarmStop[]> {
  if (!fullAlarmSupported()) return [];
  try {
    const { stops } = await NativeAlarm.consumeStops();
    return stops ?? [];
  } catch {
    return [];
  }
}
