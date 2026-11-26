const KEY = 'nadi.apk-banner-dismissed';

// Penolakan disimpan di perangkat, tidak perlu ikut diekspor.
export function readApkBannerDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function writeApkBannerDismissed(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // Penyimpanan tidak tersedia. Abaikan.
  }
}
