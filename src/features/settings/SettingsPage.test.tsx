import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/db';
import { getClockFormat, getTemperatureUnit } from '@/lib/format/preferences';
import { renderWithProviders as render } from '@/test/render';
import SettingsPage from './SettingsPage';

async function storedSettings(): Promise<Record<string, unknown>> {
  const row = await db.settings.get('app');
  return (row?.value as Record<string, unknown>) ?? {};
}

describe('SettingsPage', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('mengubah satuan suhu dan menyimpannya', async () => {
    render(<SettingsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    await waitFor(() => expect(getTemperatureUnit()).toBe('fahrenheit'));
    await waitFor(async () => expect((await storedSettings()).temperatureUnit).toBe('fahrenheit'));
  });

  it('mengubah format jam', async () => {
    render(<SettingsPage />);

    await userEvent.click(screen.getByRole('button', { name: '12 jam' }));

    await waitFor(() => expect(getClockFormat()).toBe('12h'));
    await waitFor(async () => expect((await storedSettings()).clockFormat).toBe('12h'));
  });

  it('mengubah awal minggu', async () => {
    render(<SettingsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Minggu' }));

    await waitFor(async () => expect((await storedSettings()).weekStart).toBe(0));
  });

  it('mengubah rumus berat ideal dan menyimpannya', async () => {
    render(<SettingsPage />);

    await userEvent.selectOptions(screen.getByLabelText('Rumus berat ideal'), 'hamwi');

    await waitFor(async () => expect((await storedSettings()).idealWeightFormula).toBe('hamwi'));
  });
});
