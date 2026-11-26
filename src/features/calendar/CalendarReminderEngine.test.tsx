import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CalendarEvent } from '@/lib/db/db';

const holder = vi.hoisted(() => ({ events: [] as CalendarEvent[] }));
const markReminderFired = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('./useEvents', () => ({ useRemindersBetween: () => holder.events }));
vi.mock('./events-repo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./events-repo')>();
  return { ...actual, markReminderFired };
});
vi.mock('@/features/alarms/alarm-sound', () => ({ startAlarmSound: () => () => {} }));

import { CalendarReminderEngine } from './CalendarReminderEngine';

const noopSound = () => () => {};

function eventAt(start: Date, overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'e1',
    title: 'Rapat',
    start: start.getTime(),
    end: null,
    allDay: false,
    reminderMinutes: 0,
    reminderSoundId: 'nadi',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('CalendarReminderEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    holder.events = [];
    markReminderFired.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('berbunyi saat waktu pengingat agenda tiba', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 9, 0, 30));
    holder.events = [eventAt(new Date(2026, 10, 26, 9, 0, 0))];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.getByText('Rapat')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('berbunyi sesuai menit pengingat sebelum mulai', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 8, 45, 10));
    holder.events = [eventAt(new Date(2026, 10, 26, 9, 0, 0), { reminderMinutes: 15 })];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.getByText('Rapat')).toBeInTheDocument();
  });

  it('menandai pengingat sudah berbunyi saat dimatikan', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 9, 0, 30));
    holder.events = [eventAt(new Date(2026, 10, 26, 9, 0, 0))];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Matikan' }));
    await act(async () => {});

    expect(screen.queryByText('Rapat')).not.toBeInTheDocument();
    expect(markReminderFired).toHaveBeenCalledWith('e1', expect.any(Number));
  });

  it('menunda lalu berbunyi lagi setelah lima menit', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 9, 0, 30));
    holder.events = [eventAt(new Date(2026, 10, 26, 9, 0, 0))];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tunda 5 menit' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.queryByText('Rapat')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1000);
    });
    expect(screen.getByText('Rapat')).toBeInTheDocument();
  });

  it('tidak berbunyi untuk agenda yang pengingatnya sudah ditandai', async () => {
    const start = new Date(2026, 10, 26, 9, 0, 0);
    vi.setSystemTime(new Date(2026, 10, 26, 9, 0, 30));
    holder.events = [eventAt(start, { reminderFiredAt: start.getTime() })];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.queryByText('Rapat')).not.toBeInTheDocument();
  });

  it('tidak berbunyi saat pengingat terlewat jauh', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 9, 10, 0));
    holder.events = [eventAt(new Date(2026, 10, 26, 9, 0, 0))];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.queryByText('Rapat')).not.toBeInTheDocument();
  });

  it('mengabaikan agenda tanpa pengingat', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 9, 0, 30));
    holder.events = [eventAt(new Date(2026, 10, 26, 9, 0, 0), { reminderMinutes: null })];
    render(<CalendarReminderEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.queryByText('Rapat')).not.toBeInTheDocument();
  });
});
