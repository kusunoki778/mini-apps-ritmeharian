import { DownloadSimple } from '@phosphor-icons/react';

import { APK_FILE_NAME, APK_URL } from './apk';
import { useApkAvailability } from './useApkAvailability';

export function ApkDownload() {
  const availability = useApkAvailability();

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-ink-muted">
        Pasang Nadi sebagai aplikasi Android supaya alarm berbunyi tepat waktu walau aplikasi
        tertutup. Berkasnya berformat APK dan dipasang di luar Play Store.
      </p>

      {availability === 'available' ? (
        <a
          href={APK_URL}
          download={APK_FILE_NAME}
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-accent px-4 text-sm font-semibold text-paper"
        >
          <DownloadSimple size={18} aria-hidden="true" />
          Unduh APK
        </a>
      ) : availability === 'checking' ? (
        <p className="text-sm text-ink-muted">Memeriksa ketersediaan berkas.</p>
      ) : (
        <p className="text-sm text-ink-muted">
          Berkas APK belum tersedia di server ini. Bangun APK lebih dulu, lihat README.
        </p>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Saat memasang, aktifkan izin pemasangan dari sumber ini, lalu pilih Pasang.
      </p>
    </div>
  );
}
