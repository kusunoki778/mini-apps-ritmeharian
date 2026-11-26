import { describe, expect, it } from 'vitest';

import { ALARM_SOUNDS, DEFAULT_ALARM_SOUND, alarmSoundLabel, isAlarmSoundId } from './alarm-sounds';

describe('ALARM_SOUNDS', () => {
  it('menyediakan enam nada unik', () => {
    expect(ALARM_SOUNDS).toHaveLength(6);
    expect(new Set(ALARM_SOUNDS.map((option) => option.id)).size).toBe(6);
  });

  it('mencakup nada bawaan sebagai default', () => {
    expect(ALARM_SOUNDS.some((option) => option.id === DEFAULT_ALARM_SOUND)).toBe(true);
  });
});

describe('isAlarmSoundId', () => {
  it('menerima id yang dikenal dan menolak yang lain', () => {
    expect(isAlarmSoundId('nadi')).toBe(true);
    expect(isAlarmSoundId('lonceng')).toBe(true);
    expect(isAlarmSoundId('tidak-ada')).toBe(false);
    expect(isAlarmSoundId(undefined)).toBe(false);
  });
});

describe('alarmSoundLabel', () => {
  it('mengembalikan label atau jatuh ke Nadi', () => {
    expect(alarmSoundLabel('tegas')).toBe('Tegas');
    expect(alarmSoundLabel('tidak-ada')).toBe('Nadi');
  });
});
