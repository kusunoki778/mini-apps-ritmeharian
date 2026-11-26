import { useEffect, useState } from 'react';

import { useRemindersBetween } from '@/features/calendar/useEvents';
import { useSettings } from '@/features/settings/useSettings';
import { nativeAlarmsSupported, syncNativeAlarms } from './alarm-scheduler';
import { useAlarms } from './useAlarms';

const WINDOW_MS = 60 * 24 * 60 * 60 * 1000;

// Menjembatani daftar alarm Dexie dan pengingat agenda ke penjadwal native. Saat
// boot, serta setiap daftar berubah, notifikasi native diselaraskan ulang. Di web
// komponen ini diam.
export function NativeAlarmSync() {
  const alarms = useAlarms();
  const { settings } = useSettings();
  const soundId = settings.alarmSoundId;
  const [from] = useState(() => Date.now());
  const events = useRemindersBetween(from, from + WINDOW_MS);

  useEffect(() => {
    if (!nativeAlarmsSupported() || alarms === undefined || events === undefined) return;

    void syncNativeAlarms(alarms, new Date(), soundId, events).catch(() => {
      // Kegagalan penjadwalan native tidak boleh menjatuhkan antarmuka.
    });
  }, [alarms, events, soundId]);

  return null;
}
