import { useContext } from 'react';

import { DEFAULT_ALARM_SOUND, type AlarmSoundId } from '@/features/alarms/alarm-sounds';
import { SettingsContext } from './settings-context';

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings harus dipakai di dalam SettingsProvider.');
  }

  return context;
}

// Nada alarm dipakai oleh komponen yang juga dirender sendiri saat pengujian, jadi
// nilainya dibaca dengan aman dan jatuh ke nada bawaan saat tidak ada penyedia.
export function useAlarmSoundId(): AlarmSoundId {
  const context = useContext(SettingsContext);
  return context?.settings.alarmSoundId ?? DEFAULT_ALARM_SOUND;
}
