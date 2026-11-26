import { useEffect, useState } from 'react';

import { APK_RELEASE_URL, APK_URL } from './apk';

export interface ApkAvailability {
  status: 'checking' | 'available' | 'missing';
  /** Alamat unduhan yang dipakai. Berkas lokal lebih dulu, lalu aset rilis GitHub. */
  url: string;
}

// Memastikan tawaran unduh hanya muncul bila berkasnya benar-benar ada. Berkas
// lokal dicek lewat permintaan HEAD. Bila tidak ada, unduhan diarahkan ke aset
// rilis GitHub tanpa dicek, karena aset rilis tidak mengizinkan lintas asal.
export function useApkAvailability(): ApkAvailability {
  const [availability, setAvailability] = useState<ApkAvailability>({
    status: 'checking',
    url: APK_URL,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(APK_URL, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        if (!active) return;
        setAvailability(isApkFile(response) ? local() : fallback());
      })
      .catch(() => {
        if (active) setAvailability(fallback());
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return availability;
}

// Sebagian hosting membalas 200 dengan halaman aplikasi untuk berkas yang tidak
// ada, jadi tipe konten ikut dicek agar tidak mengunduh HTML sebagai APK.
function isApkFile(response: Response): boolean {
  if (!response.ok) return false;
  const type = response.headers.get('content-type') ?? '';
  return type.includes('android.package-archive');
}

function local(): ApkAvailability {
  return { status: 'available', url: APK_URL };
}

function fallback(): ApkAvailability {
  if (APK_RELEASE_URL) return { status: 'available', url: APK_RELEASE_URL };
  return { status: 'missing', url: APK_URL };
}
