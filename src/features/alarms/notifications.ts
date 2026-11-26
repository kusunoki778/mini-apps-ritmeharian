import { Capacitor } from '@capacitor/core';

export type PermissionState = NotificationPermission | 'unsupported';

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): PermissionState {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function showAlarmNotification(label: string, time: string): void {
  // Di dalam pembungkus native, notifikasi sistem sudah dijadwalkan terpisah,
  // jadi jangan tampilkan notifikasi web agar tidak dobel.
  if (Capacitor.isNativePlatform()) return;
  if (!notificationsSupported() || Notification.permission !== 'granted') return;

  try {
    new Notification(`Alarm ${time}`, { body: label, tag: 'nadi-alarm' });
  } catch {
    // Sebagian browser menolak notifikasi dari konteks non-persisten, abaikan saja.
  }
}
