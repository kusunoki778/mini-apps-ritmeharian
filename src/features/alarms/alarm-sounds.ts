export type AlarmSoundId = 'nadi' | 'lembut' | 'tegas' | 'lonceng' | 'denyut' | 'fajar';

export interface AlarmSoundOption {
  id: AlarmSoundId;
  label: string;
}

// Harus cocok dengan AlarmSounds.java di aplikasi Android. Semua nada dibundel di
// aplikasi, jadi alarm berbunyi tanpa internet.
export const ALARM_SOUNDS: AlarmSoundOption[] = [
  { id: 'nadi', label: 'Nadi' },
  { id: 'lembut', label: 'Lembut' },
  { id: 'tegas', label: 'Tegas' },
  { id: 'lonceng', label: 'Lonceng' },
  { id: 'denyut', label: 'Denyut' },
  { id: 'fajar', label: 'Fajar' },
];

export const DEFAULT_ALARM_SOUND: AlarmSoundId = 'nadi';

export function isAlarmSoundId(value: unknown): value is AlarmSoundId {
  return typeof value === 'string' && ALARM_SOUNDS.some((option) => option.id === value);
}

export function alarmSoundLabel(id: string): string {
  return ALARM_SOUNDS.find((option) => option.id === id)?.label ?? 'Nadi';
}
