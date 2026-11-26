import { Capacitor } from '@capacitor/core';

// Berkas APK disajikan di akar situs oleh plugin vite (lihat vite.config.ts).
export const APK_URL = '/Nadi.apk';
export const APK_FILE_NAME = 'Nadi.apk';

// Di dalam pembungkus native menawarkan unduh APK tidak masuk akal.
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
