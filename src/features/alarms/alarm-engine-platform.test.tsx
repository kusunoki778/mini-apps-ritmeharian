import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Alarm } from '@/lib/db/db';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true },
}));

const holder = vi.hoisted(() => ({ alarms: [] as Alarm[] }));
const markTriggered = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('./useAlarms', () => ({ useAlarms: () => holder.alarms }));
vi.mock('./alarms-repo', () => ({ markTriggered }));
vi.mock('./notifications', () => ({ showAlarmNotification: () => {} }));

import { AlarmEngine } from './AlarmEngine';

// Di dalam APK, layanan Android yang membunyikan alarm. Mesin web harus diam supaya
// nada tidak dobel dan alarm tidak ditandai terlewat saat aplikasi dibuka terlambat.
describe('AlarmEngine di dalam aplikasi native', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    holder.alarms = [];
    markTriggered.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tidak berbunyi dan tidak menandai alarm terlewat', async () => {
    vi.setSystemTime(new Date(2026, 10, 26, 7, 30, 30));
    holder.alarms = [
      {
        id: 'a',
        label: 'Bangun',
        hour: 7,
        minute: 30,
        days: [],
        enabled: true,
        snoozeMinutes: 5,
      },
    ];

    const soundFactory = vi.fn(() => () => {});
    render(<AlarmEngine soundFactory={soundFactory} intervalMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(soundFactory).not.toHaveBeenCalled();
    expect(screen.queryByText('Bangun')).not.toBeInTheDocument();
    expect(markTriggered).not.toHaveBeenCalled();
  });
});
