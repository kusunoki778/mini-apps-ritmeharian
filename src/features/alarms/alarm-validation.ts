import { parseTimeInput } from './alarm-utils';
import type { AlarmInput } from './alarms-repo';

export interface AlarmErrors {
  time?: string;
  days?: string;
}

export function validateAlarm(input: AlarmInput): AlarmErrors {
  const errors: AlarmErrors = {};

  if (!parseTimeInput(input.time)) {
    errors.time = 'Waktu tidak valid.';
  }

  if (input.repeat === 'custom' && input.days.length === 0) {
    errors.days = 'Pilih minimal satu hari.';
  }

  return errors;
}

export function hasAlarmErrors(errors: AlarmErrors): boolean {
  return Boolean(errors.time || errors.days);
}
