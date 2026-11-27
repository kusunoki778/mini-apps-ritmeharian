import { useEffect, useState } from 'react';

import { RingScreen } from './RingScreen';
import {
  consumeNativeStops,
  fullAlarmSupported,
  getNativeRinging,
  snoozeNativeRinging,
  stopNativeRinging,
  type NativeRinging,
} from './native-alarm';
import { applyNativeStops } from './native-stops';

const POLL_MS = 2000;

interface NativeAlarmOverlayProps {
  intervalMs?: number;
}

function formatTime(at: number): string {
  const date = new Date(at);
  return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`;
}

// Jaring pengaman untuk alarm native. Bunyi tetap ditangani layanan Android supaya
// tidak dobel dengan Web Audio. Komponen ini menampilkan layar Matikan di dalam
// aplikasi bila intent layar penuh diblokir (Android 14 ke atas) atau notifikasi
// dimatikan, dan menyalin alarm yang dihentikan dari luar aplikasi ke Dexie.
export function NativeAlarmOverlay({ intervalMs = POLL_MS }: NativeAlarmOverlayProps) {
  const [ringing, setRinging] = useState<NativeRinging | null>(null);

  useEffect(() => {
    if (!fullAlarmSupported()) return;

    let active = true;

    const tick = async () => {
      const [next, stops] = await Promise.all([getNativeRinging(), consumeNativeStops()]);
      if (!active) return;

      if (stops.length > 0) {
        await applyNativeStops(stops).catch(() => undefined);
      }
      setRinging(next);
    };

    const run = () => void tick();
    const timer = window.setInterval(run, intervalMs);
    const initial = window.setTimeout(run, 0);
    document.addEventListener('visibilitychange', run);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.clearTimeout(initial);
      document.removeEventListener('visibilitychange', run);
    };
  }, [intervalMs]);

  if (!ringing) return null;

  const close = () => setRinging(null);

  // Timer tidak punya tunda, jadi tombolnya disembunyikan.
  const isTimer = ringing.alarmId === 'timer';
  const canSnooze = !isTimer && ringing.snoozeMinutes > 0;

  const snooze = () => {
    close();
    void snoozeNativeRinging();
  };

  const dismiss = () => {
    close();
    void stopNativeRinging(false);
  };

  return (
    <RingScreen
      kind={isTimer ? 'Timer' : 'Alarm'}
      time={formatTime(ringing.at)}
      title={ringing.label}
      snoozeLabel={canSnooze ? `Tunda ${ringing.snoozeMinutes} menit` : undefined}
      onSnooze={canSnooze ? snooze : undefined}
      onDismiss={dismiss}
      hint="Sekarang waktunya. Tekan Matikan untuk menghentikan bunyi."
    />
  );
}
