import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const holder = vi.hoisted(() => ({
  supported: true,
  ringing: null as
    | null
    | { notificationId: number; at: number; label: string; alarmId: string; snoozeMinutes: number },
  stopped: [] as boolean[],
  snoozed: 0,
  stops: [] as Array<{ alarmId: string; at: number }>,
  applied: [] as Array<{ alarmId: string; at: number }>,
}));

vi.mock('./native-alarm', () => ({
  fullAlarmSupported: () => holder.supported,
  getNativeRinging: async () => holder.ringing,
  stopNativeRinging: async (snoozed = false) => {
    holder.stopped.push(snoozed);
    holder.ringing = null;
  },
  snoozeNativeRinging: async () => {
    holder.snoozed += 1;
    holder.ringing = null;
  },
  consumeNativeStops: async () => {
    const stops = holder.stops;
    holder.stops = [];
    return stops;
  },
}));

vi.mock('./native-stops', () => ({
  applyNativeStops: async (stops: Array<{ alarmId: string; at: number }>) => {
    holder.applied.push(...stops);
  },
}));

import { NativeAlarmOverlay } from './NativeAlarmOverlay';

const ALARM = {
  notificationId: 11,
  at: new Date(2026, 10, 26, 7, 30).getTime(),
  label: 'Bangun',
  alarmId: 'a',
  snoozeMinutes: 5,
};

beforeEach(() => {
  holder.supported = true;
  holder.ringing = null;
  holder.stopped = [];
  holder.snoozed = 0;
  holder.stops = [];
  holder.applied = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NativeAlarmOverlay', () => {
  it('menampilkan tombol Matikan saat alarm native berbunyi', async () => {
    holder.ringing = ALARM;
    render(<NativeAlarmOverlay intervalMs={50} />);

    expect(await screen.findByText('Bangun')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Matikan' })).toBeInTheDocument();
    expect(screen.getByText('07.30')).toBeInTheDocument();
  });

  it('menghentikan alarm lewat lapisan native saat Matikan ditekan', async () => {
    holder.ringing = ALARM;
    render(<NativeAlarmOverlay intervalMs={50} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Matikan' }));
    await act(async () => {});

    expect(holder.stopped).toEqual([false]);
    expect(screen.queryByText('Bangun')).not.toBeInTheDocument();
  });

  it('menunda lewat lapisan native saat tombol Tunda ditekan', async () => {
    holder.ringing = ALARM;
    render(<NativeAlarmOverlay intervalMs={50} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Tunda 5 menit' }));
    await act(async () => {});

    expect(holder.snoozed).toBe(1);
  });

  it('menyembunyikan tombol Tunda untuk timer', async () => {
    holder.ringing = { ...ALARM, alarmId: 'timer', label: 'Timer', snoozeMinutes: 0 };
    render(<NativeAlarmOverlay intervalMs={50} />);

    const titles = await screen.findAllByText('Timer');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /Tunda/ })).not.toBeInTheDocument();
  });

  it('menyalin alarm yang berhenti di luar aplikasi ke Dexie', async () => {
    holder.stops = [{ alarmId: 'a', at: 1000 }];
    render(<NativeAlarmOverlay intervalMs={50} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });

    expect(holder.applied).toEqual([{ alarmId: 'a', at: 1000 }]);
  });

  it('diam di web', async () => {
    holder.supported = false;
    holder.ringing = ALARM;
    render(<NativeAlarmOverlay intervalMs={50} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });

    expect(screen.queryByText('Bangun')).not.toBeInTheDocument();
  });
});
