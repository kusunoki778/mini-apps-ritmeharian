import { useEffect, useState } from 'react';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { batteryExempt, fullAlarmSupported, requestBatteryExemption } from './native-alarm';

// OEM seperti Infinix, Xiaomi, dan Oppo bisa menghentikan layanan latar belakang.
// Pengecualian optimasi baterai membuat alarm lebih tahan saat aplikasi tertutup.
export function AlarmBatteryBanner() {
  const supported = fullAlarmSupported();
  const [exempt, setExempt] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supported) return;

    let active = true;
    const check = () => {
      void batteryExempt().then((next) => {
        if (active) setExempt(next);
      });
    };

    check();
    document.addEventListener('visibilitychange', check);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', check);
    };
  }, [supported]);

  if (!supported || exempt === null || exempt) return null;

  return (
    <div className="mb-5">
      <Banner
        variant="warning"
        action={
          <Button size="sm" onClick={() => void requestBatteryExemption()}>
            Izinkan
          </Button>
        }
      >
        Izinkan Nadi dikecualikan dari optimasi baterai agar alarm tidak dimatikan sistem saat
        aplikasi tertutup.
      </Banner>
    </div>
  );
}