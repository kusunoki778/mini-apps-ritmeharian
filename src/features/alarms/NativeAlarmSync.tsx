import { useEffect } from 'react';

import { nativeAlarmsSupported, syncNativeAlarms } from './alarm-scheduler';
import { useAlarms } from './useAlarms';

// Menjembatani daftar alarm Dexie ke penjadwal native. Saat boot dan setiap daftar
// berubah, notifikasi native diselaraskan ulang. Di web komponen ini diam.
export function NativeAlarmSync() {
  const alarms = useAlarms();

  useEffect(() => {
    if (!nativeAlarmsSupported() || alarms === undefined) return;

    void syncNativeAlarms(alarms).catch(() => {
      // Kegagalan penjadwalan native tidak boleh menjatuhkan antarmuka.
    });
  }, [alarms]);

  return null;
}
