import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import GrowthPage from './GrowthPage';

describe('GrowthPage', () => {
  it('meminta tinggi badan untuk dewasa tanpa tinggi', () => {
    render(<GrowthPage />);
    expect(screen.getByText(/Isi tinggi badan untuk menghitung berat ideal/)).toBeInTheDocument();
  });

  it('menampilkan tinggi ideal saat umur anak diisi', async () => {
    const user = userEvent.setup();
    render(<GrowthPage />);

    const age = screen.getByLabelText('Umur (tahun)');
    await user.clear(age);
    await user.type(age, '8');

    expect(screen.getByText('Tinggi ideal')).toBeInTheDocument();
    expect(screen.getByText('Berat ideal')).toBeInTheDocument();
    expect(screen.getByText(/Rentang berat gizi baik/)).toBeInTheDocument();
  });

  it('menghitung berat ideal dewasa dengan rumus Devine', async () => {
    const user = userEvent.setup();
    render(<GrowthPage />);

    await user.type(screen.getByLabelText('Tinggi badan (cm)'), '170');

    expect(screen.getByText('Berat ideal')).toBeInTheDocument();
    expect(screen.getByText('66,2')).toBeInTheDocument();
  });

  it('menampilkan status gizi saat berat diisi', async () => {
    const user = userEvent.setup();
    render(<GrowthPage />);

    const age = screen.getByLabelText('Umur (tahun)');
    await user.clear(age);
    await user.type(age, '8');
    await user.type(screen.getByLabelText('Tinggi badan (cm)'), '128');
    await user.type(screen.getByLabelText('Berat badan (kg)'), '26');

    expect(screen.getByText('Tinggi menurut umur')).toBeInTheDocument();
    expect(screen.getByText(/Status gizi/)).toBeInTheDocument();
  });
});
