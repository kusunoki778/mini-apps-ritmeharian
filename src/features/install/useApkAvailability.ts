import { useEffect, useState } from 'react';

import { APK_URL } from './apk';

export type ApkAvailability = 'checking' | 'available' | 'missing';

// Memastikan tawaran unduh hanya muncul bila berkasnya benar-benar ada.
export function useApkAvailability(): ApkAvailability {
  const [availability, setAvailability] = useState<ApkAvailability>('checking');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(APK_URL, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        if (active) setAvailability(response.ok ? 'available' : 'missing');
      })
      .catch(() => {
        if (active) setAvailability('missing');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return availability;
}
