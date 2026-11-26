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

interface NativeAlarmBridge {
  schedule(options: { alarms: NativeAlarmItem[] }): Promise<void>;
  cancel(options: { id: number }): Promise<void>;
  cancelAll(): Promise<void>;
  canScheduleExactAlarms(): Promise<{ granted: boolean }>;
  scheduleTimer(options: { at: number; label?: string; soundId?: string }): Promise<void>;
  cancelTimer(): Promise<void>;
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
