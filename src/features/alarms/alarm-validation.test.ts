import { describe, expect, it } from 'vitest';

import { DEFAULT_ALARM_SOUND } from './alarm-sounds';
import { hasAlarmErrors, validateAlarm } from './alarm-validation';
import type { AlarmInput } from './alarms-repo';

function input(overrides: Partial<AlarmInput> = {}): AlarmInput {
  return {
    label: 'Bangun',
    time: '07:30',
    repeat: 'once',
    days: [],
    snoozeMinutes: 5,
    enabled: true,
    soundId: DEFAULT_ALARM_SOUND,
    ...overrides,
  };
}

describe('validateAlarm', () => {
  it('menerima alarm yang sah', () => {
    expect(hasAlarmErrors(validateAlarm(input()))).toBe(false);
  });

  it('menolak waktu yang tidak valid', () => {
    expect(validateAlarm(input({ time: '25:00' })).time).toBeDefined();
    expect(validateAlarm(input({ time: '07' })).time).toBeDefined();
    expect(validateAlarm(input({ time: '07:75' })).time).toBeDefined();
    expect(validateAlarm(input({ time: '23:59' })).time).toBeUndefined();
  });

  it('mewajibkan minimal satu hari untuk pengulangan hari tertentu', () => {
    expect(validateAlarm(input({ repeat: 'custom', days: [] })).days).toBeDefined();
    expect(validateAlarm(input({ repeat: 'custom', days: [1] })).days).toBeUndefined();
  });

  it('mengabaikan hari untuk sekali dan harian', () => {
    expect(validateAlarm(input({ repeat: 'once', days: [] })).days).toBeUndefined();
    expect(validateAlarm(input({ repeat: 'daily', days: [] })).days).toBeUndefined();
  });
});
