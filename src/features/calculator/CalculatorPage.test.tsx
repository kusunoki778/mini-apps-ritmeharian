import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders as render } from '@/test/render';
import CalculatorPage from './CalculatorPage';

describe('CalculatorPage', () => {
  it('menghitung rumus ilmiah yang diketik', async () => {
    render(<CalculatorPage />);

    await userEvent.clear(screen.getByLabelText('Rumus'));
    await userEvent.type(screen.getByLabelText('Rumus'), '2 + 3 * 4');

    expect(await screen.findByText('= 14')).toBeInTheDocument();
  });

  it('menyisipkan fungsi dari tombol', async () => {
    render(<CalculatorPage />);

    await userEvent.click(screen.getByRole('button', { name: 'sin (sinus)' }));
    await userEvent.type(screen.getByLabelText('Rumus'), '30)');

    expect(await screen.findByText('= 0.5')).toBeInTheDocument();
  });

  it('menyimpan riwayat setelah menekan Hitung', async () => {
    render(<CalculatorPage />);

    await userEvent.type(screen.getByLabelText('Rumus'), '6*7');
    await userEvent.click(screen.getByRole('button', { name: 'hitung' }));

    expect(await screen.findByText('Riwayat')).toBeInTheDocument();
    expect(screen.getByText('6*7 = 42')).toBeInTheDocument();
  });

  it('menghitung BMI memakai ambang Asia', async () => {
    render(<CalculatorPage />);

    await userEvent.click(screen.getByRole('button', { name: 'BMI' }));
    await userEvent.type(screen.getByLabelText('Tinggi (cm)'), '170');
    await userEvent.type(screen.getByLabelText('Berat (kg)'), '70');

    expect(await screen.findByText('24.2')).toBeInTheDocument();
    expect(screen.getByText('Berlebih')).toBeInTheDocument();
  });
});
