import { Capacitor, registerPlugin } from '@capacitor/core';

// Satu kemunculan alarm yang dijadwalkan ke AlarmManager lewat plugin native.
export interface NativeAlarmItem {
  id: number;
  at: number;
  label: string;
  alarmId: string;
  snoozeMinutes: number;
}

interface NativeAlarmBridge {
  schedule(options: { alarms: NativeAlarmItem[] }): Promise<void>;
  cancel(options: { id: number }): Promise<void>;
  cancelAll(): Promise<void>;
  canScheduleExactAlarms(): Promise<{ granted: boolean }>;
}

const NativeAlarm = registerPlugin<NativeAlarmBridge>('NativeAlarm');

// Benar hanya di pembungkus native yang menyertakan plugin alarm layar penuh.
export function fullAlarmSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('NativeAlarm');
}

export function fullAlarm() {
  return NativeAlarm;
}
