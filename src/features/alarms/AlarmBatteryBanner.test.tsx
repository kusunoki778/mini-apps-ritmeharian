import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const holder = vi.hoisted(() => ({
  supported: true,
  exempt: null as boolean | null,
  requested: 0,
}));

vi.mock('./native-alarm', () => ({
  fullAlarmSupported: () => holder.supported,
  batteryExempt: async () => holder.exempt,
  requestBatteryExemption: async () => {
    holder.requested += 1;
  },
}));

import { AlarmBatteryBanner } from './AlarmBatteryBanner';

beforeEach(() => {
  holder.supported = true;
  holder.exempt = false;
  holder.requested = 0;
});

describe('AlarmBatteryBanner', () => {
  it('menawarkan pengecualian saat baterai masih mengoptimalkan', async () => {
    render(<AlarmBatteryBanner />);

    expect(await screen.findByText(/optimasi baterai/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Izinkan' }));
    await act(async () => {});

    expect(holder.requested).toBe(1);
  });

  it('diam saat Nadi sudah dikecualikan', async () => {
    holder.exempt = true;
    render(<AlarmBatteryBanner />);

    await act(async () => {});
    expect(screen.queryByText(/optimasi baterai/i)).not.toBeInTheDocument();
  });

  it('diam di web', async () => {
    holder.supported = false;
    render(<AlarmBatteryBanner />);

    await act(async () => {});
    expect(screen.queryByText(/optimasi baterai/i)).not.toBeInTheDocument();
  });
});