import { describe, expect, it } from 'vitest';

import type { Alarm } from '@/lib/db/db';
import {
  allDays,
  decideAlarm,
  formatRepeat,
  nextTrigger,
  previousTrigger,
  repeatModeFromDays,
} from './alarm-utils';

function alarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: 'a',
    label: 'Alarm',
    hour: 7,
    minute: 30,
    days: [],
    enabled: true,
    snoozeMinutes: 5,
    ...overrides,
  };
}

function localTime(timestamp: number): { hour: number; minute: number } {
  const date = new Date(timestamp);
  return { hour: date.getHours(), minute: date.getMinutes() };
}

describe('repeatModeFromDays', () => {
  it('mengenali sekali, harian, dan hari tertentu', () => {
    expect(repeatModeFromDays([])).toBe('once');
    expect(repeatModeFromDays(allDays())).toBe('daily');
    expect(repeatModeFromDays([1, 3])).toBe('custom');
  });
});

describe('formatRepeat', () => {
  it('memberi label yang jelas', () => {
    expect(formatRepeat({ days: [] })).toBe('Sekali');
    expect(formatRepeat({ days: allDays() })).toBe('Setiap hari');
  });

  it('mengurutkan hari dari Senin', () => {
    expect(formatRepeat({ days: [3, 1, 0] })).toBe('Sen, Rab, Min');
  });
});

describe('nextTrigger', () => {
  it('null saat alarm tidak aktif', () => {
    expect(nextTrigger(alarm({ enabled: false }), new Date(2026, 10, 26, 6, 0))).toBeNull();
  });

  it('sekali pakai: hari ini bila belum lewat', () => {
    const now = new Date(2026, 10, 26, 6, 0);
    const at = nextTrigger(alarm(), now);

    expect(at).not.toBeNull();
    const date = new Date(at as number);
    expect(date.getDate()).toBe(26);
    expect(localTime(at as number)).toEqual({ hour: 7, minute: 30 });
  });

  it('sekali pakai: besok bila sudah lewat', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const at = nextTrigger(alarm(), now);

    expect(new Date(at as number).getDate()).toBe(27);
  });

  it('harian: mengambil kemunculan berikutnya', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const at = nextTrigger(alarm({ days: allDays() }), now);

    expect(new Date(at as number).getDate()).toBe(27);
    expect(localTime(at as number)).toEqual({ hour: 7, minute: 30 });
  });

  it('hari tertentu: melompat ke hari yang cocok berikutnya', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const tomorrow = (now.getDay() + 1) % 7;
    const at = nextTrigger(alarm({ days: [tomorrow] }), now);

    expect(new Date(at as number).getDay()).toBe(tomorrow);
    expect(at as number).toBeGreaterThan(now.getTime());
  });

  it('hari tertentu: mundur sepekan bila hari ini sudah lewat', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const at = nextTrigger(alarm({ days: [now.getDay()] }), now);

    expect(new Date(at as number).getDay()).toBe(now.getDay());
    expect((at as number) - now.getTime()).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
  });

  it('menangani alarm tengah malam menyeberang hari', () => {
    const now = new Date(2026, 10, 26, 12, 0);
    const at = nextTrigger(alarm({ hour: 0, minute: 0 }), now);

    const date = new Date(at as number);
    expect(date.getDate()).toBe(27);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it('menyeberang pergantian tahun', () => {
    const now = new Date(2026, 11, 31, 23, 0);
    const at = nextTrigger(alarm(), now);

    const date = new Date(at as number);
    expect(date.getFullYear()).toBe(2027);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  it('tidak menggeser jam dinding pada pergantian waktu musiman', () => {
    // Akhir Maret: banyak zona beralih ke waktu musim panas pada dini hari.
    const now = new Date(2026, 2, 28, 23, 0);
    const at = nextTrigger(alarm({ days: allDays() }), now);

    expect(localTime(at as number)).toEqual({ hour: 7, minute: 30 });
  });
});

describe('previousTrigger', () => {
  it('sekali pakai: null bila waktu hari ini belum lewat', () => {
    expect(previousTrigger(alarm(), new Date(2026, 10, 26, 6, 0))).toBeNull();
  });

  it('sekali pakai: waktu hari ini bila sudah lewat', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const at = previousTrigger(alarm(), now);

    expect(localTime(at as number)).toEqual({ hour: 7, minute: 30 });
    expect(new Date(at as number).getDate()).toBe(26);
  });

  it('harian: mengambil kemunculan terakhir yang lewat', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const at = previousTrigger(alarm({ days: allDays() }), now);

    expect(new Date(at as number).getDate()).toBe(26);
    expect(at as number).toBeLessThanOrEqual(now.getTime());
  });
});

describe('decideAlarm', () => {
  it('idle saat alarm tidak aktif', () => {
    expect(decideAlarm(alarm({ enabled: false }), new Date(2026, 10, 26, 7, 30, 10))).toEqual({
      type: 'idle',
    });
  });

  it('berbunyi tepat pada waktunya', () => {
    expect(decideAlarm(alarm(), new Date(2026, 10, 26, 7, 30, 0)).type).toBe('ring');
  });

  it('berbunyi dalam jendela 60 detik', () => {
    expect(decideAlarm(alarm(), new Date(2026, 10, 26, 7, 30, 45)).type).toBe('ring');
  });

  it('menandai terlewat di luar jendela 60 detik', () => {
    const decision = decideAlarm(alarm(), new Date(2026, 10, 26, 7, 32, 0));
    expect(decision.type).toBe('missed');
  });

  it('tidak berbunyi lagi bila waktu pemicu sudah ditangani', () => {
    const now = new Date(2026, 10, 26, 7, 31, 0);
    const at = previousTrigger(alarm(), now);
    const handled = alarm({ lastTriggeredAt: at as number });

    expect(decideAlarm(handled, now)).toEqual({ type: 'idle' });
  });

  it('idle saat belum ada kemunculan yang lewat', () => {
    expect(decideAlarm(alarm(), new Date(2026, 10, 26, 6, 0))).toEqual({ type: 'idle' });
  });

  it('idle bila kemunculan terjadi sebelum alarm dibuat', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const createdAt = new Date(2026, 10, 26, 8, 0).getTime();

    expect(decideAlarm(alarm({ createdAt }), now)).toEqual({ type: 'idle' });
  });

  it('tetap menandai terlewat bila alarm dibuat sebelum kemunculan', () => {
    const now = new Date(2026, 10, 26, 8, 0);
    const createdAt = new Date(2026, 10, 26, 6, 0).getTime();

    expect(decideAlarm(alarm({ createdAt }), now).type).toBe('missed');
  });
});
