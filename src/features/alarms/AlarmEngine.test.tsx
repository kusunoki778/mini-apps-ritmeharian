import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Alarm } from '@/lib/db/db';

const holder = vi.hoisted(() => ({ alarms: [] as Alarm[] }));
const markTriggered = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('./useAlarms', () => ({ useAlarms: () => holder.alarms }));
vi.mock('./alarms-repo', () => ({ markTriggered }));
vi.mock('./alarm-sound', () => ({ startAlarmSound: () => () => {} }));
vi.mock('./notifications', () => ({ showAlarmNotification: () => {} }));

import { AlarmEngine } from './AlarmEngine';

const noopSound = () => () => {};

function dueAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: 'a',
    label: 'Bangun',
    hour: 7,
    minute: 30,
    days: [],
    enabled: true,
    snoozeMinutes: 5,
    ...overrides,
  };
}

describe('AlarmEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    holder.alarms = [];
    markTriggered.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('membunyikan alarm saat jatuh tempo', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 7, 30, 30));
    holder.alarms = [dueAlarm()];
    render(<AlarmEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.getByText('Bangun')).toBeInTheDocument();
  });

  it('menunda lalu berbunyi lagi setelah menit tunda', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 7, 30, 30));
    holder.alarms = [dueAlarm()];
    render(<AlarmEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByText('Bangun')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tunda 5 menit' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.queryByText('Bangun')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1000);
    });
    expect(screen.getByText('Bangun')).toBeInTheDocument();
  });

  it('memutar nada khusus alarm bila dipilih', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 7, 30, 30));
    holder.alarms = [dueAlarm({ soundId: 'fajar' })];
    const factory = vi.fn(() => () => {});
    render(<AlarmEngine soundFactory={factory} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(factory).toHaveBeenCalledWith('fajar');
  });

  it('berhenti saat dimatikan dan menandai sekali pakai menjadi nonaktif', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 7, 30, 30));
    holder.alarms = [dueAlarm()];
    render(<AlarmEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Matikan' }));
    await act(async () => {});

    expect(screen.queryByText('Bangun')).not.toBeInTheDocument();
    expect(markTriggered).toHaveBeenCalledWith('a', expect.any(Number), true);
  });

  it('tidak berbunyi saat alarm terlewat lebih dari 60 detik', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 7, 40, 0));
    holder.alarms = [dueAlarm()];
    render(<AlarmEngine soundFactory={noopSound} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.queryByText('Bangun')).not.toBeInTheDocument();
    expect(markTriggered).toHaveBeenCalledWith('a', expect.any(Number), true);
  });
});
