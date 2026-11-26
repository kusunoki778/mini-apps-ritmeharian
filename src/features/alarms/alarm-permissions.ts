import { Capacitor } from '@capacitor/core';

import { fullAlarm, fullAlarmSupported } from './native-alarm';

// Status izin yang dibutuhkan agar alarm berbunyi tepat waktu di Android:
// notifikasi (Android 13+), alarm pasti, dan intent layar penuh (Android 14+).
export interface AlarmPermissions {
  notifications: boolean;
  exactAlarm: boolean;
  fullScreen: boolean;
}

export function alarmPermissionsSupported(): boolean {
  return Capacitor.isNativePlatform();
}

async function notificationsPlugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

async function fullScreenIntentGranted(): Promise<boolean> {
  if (!fullAlarmSupported()) return true;
  try {
    const { granted } = await fullAlarm().canUseFullScreenIntent();
    return granted;
  } catch {
    return true;
  }
}

// Baca status izin tanpa memicu dialog apa pun, untuk memutuskan perlu atau tidak
// menampilkan ajakan izin.
export async function alarmPermissionState(): Promise<AlarmPermissions> {
  if (!alarmPermissionsSupported()) {
    return { notifications: false, exactAlarm: false, fullScreen: false };
  }

  const LocalNotifications = await notificationsPlugin();
  const [display, exact] = await Promise.all([
    LocalNotifications.checkPermissions()
      .then((status) => status.display === 'granted')
      .catch(() => false),
    LocalNotifications.checkExactNotificationSetting()
      .then((status) => status.exact_alarm === 'granted')
      .catch(() => false),
  ]);

  return { notifications: display, exactAlarm: exact, fullScreen: await fullScreenIntentGranted() };
}

// Minta seluruh izin alarm. Notifikasi memunculkan dialog sistem, alarm pasti dan
// intent layar penuh membuka pengaturan terkait. Mengembalikan status terakhir
// supaya pemanggil bisa memberi tahu pengguna.
export async function ensureAlarmPermissions(): Promise<AlarmPermissions> {
  if (!alarmPermissionsSupported()) {
    return { notifications: false, exactAlarm: false, fullScreen: false };
  }

  const LocalNotifications = await notificationsPlugin();
  await LocalNotifications.requestPermissions().catch(() => undefined);

  const exact = await LocalNotifications.checkExactNotificationSetting().catch(() => null);
  if (exact && exact.exact_alarm !== 'granted') {
    await LocalNotifications.changeExactNotificationSetting().catch(() => undefined);
  }

  if (fullAlarmSupported()) {
    const granted = await fullScreenIntentGranted();
    if (!granted) {
      await fullAlarm()
        .openFullScreenIntentSettings()
        .catch(() => undefined);
    }
  }

  return alarmPermissionState();
}

export function alarmPermissionsComplete(state: AlarmPermissions): boolean {
  return state.notifications && state.exactAlarm && state.fullScreen;
}
