import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders as render } from '@/test/render';
import { CompassCard } from './CompassCard';

function tilt(alpha: number) {
  const event = new Event('deviceorientation');
  Object.defineProperty(event, 'alpha', { value: alpha });
  window.dispatchEvent(event);
}

describe('CompassCard', () => {
  it('menampilkan state awal sebelum sensor aktif', () => {
    render(<CompassCard />);

    expect(screen.getByText('Kompas')).toBeInTheDocument();
    expect(screen.getByText('--°')).toBeInTheDocument();
    expect(screen.getByText('Sensor belum aktif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aktifkan kompas' })).toBeInTheDocument();
  });

  it('memperbarui arah dari sensor perangkat', async () => {
    render(<CompassCard />);

    await act(async () => {
      tilt(90);
    });

    expect(screen.getByText('270°')).toBeInTheDocument();
    expect(screen.getByText('Barat')).toBeInTheDocument();
  });
});
