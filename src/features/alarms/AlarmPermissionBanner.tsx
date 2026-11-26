import { useEffect, useState } from 'react';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast-store';
import {
  alarmPermissionState,
  alarmPermissionsComplete,
  alarmPermissionsSupported,
  ensureAlarmPermissions,
  type AlarmPermissions,
} from './alarm-permissions';

// Ajakan izin yang terlihat. Sebelumnya izin hanya diminta diam-diam saat alarm
// disimpan, jadi pengguna tidak pernah melihat dialognya dan menyangka tidak ada
// permintaan izin sama sekali.
export function AlarmPermissionBanner() {
  const supported = alarmPermissionsSupported();
  const [state, setState] = useState<AlarmPermissions | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!supported) return;

    let active = true;
    void alarmPermissionState()
      .then((next) => {
        if (active) setState(next);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [supported]);

  if (!supported || state === null || alarmPermissionsComplete(state)) return null;

  const missing: string[] = [];
  if (!state.notifications) missing.push('notifikasi');
  if (!state.exactAlarm) missing.push('alarm tepat waktu');
  if (!state.fullScreen) missing.push('layar penuh');

  const ask = async () => {
    setAsking(true);
    try {
      const next = await ensureAlarmPermissions();
      setState(next);
      if (alarmPermissionsComplete(next)) {
        toast('Izin alarm sudah aktif.', 'success');
      } else {
        toast(`Masih ada izin yang kurang: ${missing.join(', ')}.`, 'error');
      }
    } catch {
      toast('Izin alarm gagal diminta.', 'error');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="mb-5">
      <Banner
        variant="warning"
        action={
          <Button size="sm" isLoading={asking} onClick={() => void ask()}>
            Izinkan
          </Button>
        }
      >
        {`Izinkan ${missing.join(', ')} agar alarm berbunyi tepat waktu, bahkan saat Nadi tertutup.`}
      </Banner>
    </div>
  );
}
