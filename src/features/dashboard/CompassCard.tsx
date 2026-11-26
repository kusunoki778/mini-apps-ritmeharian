import { Compass } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/Card';

function direction(degrees: number) {
  return [
    'Utara',
    'Timur Laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat Daya',
    'Barat',
    'Barat Laut',
  ][Math.round(degrees / 45) % 8];
}

export function CompassCard() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);

  useEffect(() => {
    const onOrientation = (event: DeviceOrientationEvent) => {
      const value = event.alpha;
      if (typeof value === 'number') setHeading((360 - value) % 360);
    };
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => window.removeEventListener('deviceorientation', onOrientation, true);
  }, []);

  const enable = async () => {
    const request = (
      DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      }
    ).requestPermission;
    if (request && (await request()) !== 'granted') {
      setPermissionNeeded(true);
      return;
    }
    setPermissionNeeded(false);
  };

  return (
    <Card className="mt-6 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Compass size={18} aria-hidden="true" /> Kompas
      </div>
      <div className="mt-4 flex items-center gap-5">
        <div
          className="flex size-20 shrink-0 items-center justify-center rounded-full border border-line bg-paper"
          style={{ transform: `rotate(${heading ?? 0}deg)` }}
        >
          <Compass size={40} className="text-accent" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {heading === null ? '--°' : `${Math.round(heading)}°`}
          </p>
          <p className="text-sm text-ink-muted">
            {heading === null ? 'Sensor belum aktif' : direction(heading)}
          </p>
        </div>
      </div>
      {heading === null ? (
        <button
          type="button"
          onClick={() => void enable()}
          className="mt-4 min-h-11 rounded-control border border-line px-4 text-sm font-medium"
        >
          Aktifkan kompas
        </button>
      ) : null}
      {permissionNeeded ? (
        <p className="mt-2 text-[13px] text-danger">
          Izin sensor ditolak. Buka izin sensor di pengaturan browser.
        </p>
      ) : null}
      <p className="mt-3 text-[13px] text-ink-muted">
        Kompas memakai sensor perangkat. API internet tidak dipakai untuk arah agar tetap akurat dan
        bisa offline.
      </p>
    </Card>
  );
}
