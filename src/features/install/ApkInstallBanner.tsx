import { DownloadSimple, X } from '@phosphor-icons/react';
import { useState } from 'react';

import { Banner } from '@/components/ui/Banner';
import { APK_FILE_NAME, APK_URL, isNativeApp } from './apk';
import { readApkBannerDismissed, writeApkBannerDismissed } from './banner-dismissed';
import { useApkAvailability } from './useApkAvailability';

// Tawaran sekali muncul saat membuka web di peramban. Bisa ditolak permanen.
export function ApkInstallBanner() {
  const availability = useApkAvailability();
  const [dismissed, setDismissed] = useState(readApkBannerDismissed);

  if (isNativeApp() || dismissed || availability !== 'available') {
    return null;
  }

  return (
    <div className="mb-6">
      <Banner
        action={
          <div className="flex items-center gap-1">
            <a
              href={APK_URL}
              download={APK_FILE_NAME}
              className="inline-flex min-h-11 items-center gap-2 rounded-control bg-accent px-4 text-sm font-semibold text-paper"
            >
              <DownloadSimple size={18} aria-hidden="true" />
              Unduh APK
            </a>
            <button
              type="button"
              aria-label="Tutup tawaran unduh"
              onClick={() => {
                writeApkBannerDismissed();
                setDismissed(true);
              }}
              className="flex size-11 items-center justify-center rounded-control text-ink-muted transition-colors hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        }
      >
        Nadi tersedia sebagai aplikasi Android. Pasang APK-nya supaya alarm berbunyi tepat waktu
        saat ponsel tertutup.
      </Banner>
    </div>
  );
}
