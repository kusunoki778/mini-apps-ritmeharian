import { Capacitor } from '@capacitor/core';

// Berkas APK disajikan di akar situs oleh plugin vite (lihat vite.config.ts) saat
// dev dan pratinjau. Di hosting statis seperti Vercel berkas itu tidak ada.
export const APK_URL = '/Nadi.apk';
export const APK_FILE_NAME = 'Nadi.apk';

// Cadangan untuk hosting statis: aset rilis GitHub. Nama aset harus Nadi.apk.
export const APK_RELEASE_URL =
  'https://github.com/kusunoki778/mini-apps-ritmeharian/releases/latest/download/Nadi.apk';

// Di dalam pembungkus native menawarkan unduh APK tidak masuk akal.
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
