import { isSameMonth } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { CalendarEvent } from '@/lib/db/db';
import {
  buildMonthGrid,
  combineDateAndTime,
  dayStart,
  formatEventTime,
  groupByDayKey,
  monthRange,
  parseDateKey,
  toDateKey,
  weekdayLabels,
} from './calendar-utils';

const base: CalendarEvent = {
  id: 'x',
  title: 't',
  start: 0,
  end: null,
  allDay: false,
  createdAt: 0,
  updatedAt: 0,
};

function inMonthCount(year: number, month: number, weekStart: 0 | 1 = 1): number {
  const target = new Date(year, month, 1);
  return buildMonthGrid(target, weekStart).filter((day) => isSameMonth(day, target)).length;
}

describe('buildMonthGrid', () => {
  it('selalu kelipatan tujuh hari', () => {
    for (const [year, month] of [
      [2026, 1],
      [2024, 1],
      [2026, 3],
      [2026, 4],
      [2025, 11],
      [2026, 0],
    ] as const) {
      expect(buildMonthGrid(new Date(year, month, 1)).length % 7).toBe(0);
    }
  });

  it('benar untuk bulan 28, 29, 30, dan 31 hari', () => {
    expect(inMonthCount(2026, 1)).toBe(28);
    expect(inMonthCount(2024, 1)).toBe(29);
    expect(inMonthCount(2026, 3)).toBe(30);
    expect(inMonthCount(2026, 4)).toBe(31);
  });

  it('menyeberang pergantian tahun', () => {
    const desember = buildMonthGrid(new Date(2025, 11, 1));
    const januari = buildMonthGrid(new Date(2026, 0, 1));

    expect(desember.some((day) => toDateKey(day) === '2026-01-01')).toBe(true);
    expect(januari.some((day) => toDateKey(day) === '2025-12-31')).toBe(true);
  });

  it('menghormati awal minggu', () => {
    const senin = buildMonthGrid(new Date(2026, 4, 1), 1);
    const minggu = buildMonthGrid(new Date(2026, 4, 1), 0);

    expect(senin[0].getDay()).toBe(1);
    expect(minggu[0].getDay()).toBe(0);
  });
});

describe('weekdayLabels', () => {
  it('mulai Senin atau Minggu sesuai pengaturan', () => {
    expect(weekdayLabels(1)[0]).toBe('Sen');
    expect(weekdayLabels(0)[0]).toBe('Min');
    expect(weekdayLabels(1)).toHaveLength(7);
  });
});

describe('kunci tanggal dan waktu', () => {
  it('bolak-balik kunci tanggal', () => {
    const date = new Date(2026, 10, 5);
    expect(parseDateKey(toDateKey(date)).getDate()).toBe(5);
  });

  it('menggabungkan tanggal dan jam pada waktu lokal', () => {
    const ms = combineDateAndTime('2026-11-26', '09:30');
    const date = new Date(ms);

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(26);
    expect(date.getHours()).toBe(9);
    expect(date.getMinutes()).toBe(30);
  });

  it('menghitung rentang grid bulan', () => {
    const range = monthRange(new Date(2026, 4, 15));
    expect(range.from).toBeLessThanOrEqual(dayStart(new Date(2026, 4, 1)));
    expect(range.to).toBeGreaterThan(dayStart(new Date(2026, 4, 31)));
  });
});

describe('formatEventTime', () => {
  it('menandai agenda sepanjang hari', () => {
    expect(formatEventTime({ ...base, allDay: true, start: dayStart(new Date(2026, 4, 1)) })).toBe(
      'Sepanjang hari',
    );
  });

  it('menampilkan rentang waktu', () => {
    const start = combineDateAndTime('2026-11-26', '09:30');
    const end = combineDateAndTime('2026-11-26', '10:30');

    expect(formatEventTime({ ...base, start, end })).toBe('09.30-10.30');
    expect(formatEventTime({ ...base, start })).toBe('09.30');
  });
});

describe('groupByDayKey', () => {
  it('mengelompokkan agenda per hari', () => {
    const events: CalendarEvent[] = [
      { ...base, id: 'a', start: combineDateAndTime('2026-11-26', '09:00') },
      { ...base, id: 'b', start: combineDateAndTime('2026-11-26', '15:00') },
      { ...base, id: 'c', start: combineDateAndTime('2026-11-27', '08:00') },
    ];

    const grouped = groupByDayKey(events);
    expect(grouped.get('2026-11-26')).toHaveLength(2);
    expect(grouped.get('2026-11-27')).toHaveLength(1);
  });
});
