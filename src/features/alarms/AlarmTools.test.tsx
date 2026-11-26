import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders as render } from '@/test/render';
import { AlarmTools } from './AlarmTools';

describe('AlarmTools', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('tidak lagi memuat kalkulator', () => {
    render(<AlarmTools />);
    expect(screen.queryByText('Kalkulator')).not.toBeInTheDocument();
  });

  it('menjalankan dan mereset stopwatch', async () => {
    vi.useFakeTimers();
    render(<AlarmTools />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Mulai' })[0]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByText('00:00:03')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Reset' })[0]);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('menghitung mundur timer lalu bisa direset', async () => {
    vi.useFakeTimers();
    render(<AlarmTools />);

    fireEvent.change(screen.getByLabelText('Menit'), { target: { value: '1' } });

    fireEvent.click(screen.getAllByRole('button', { name: 'Mulai' })[1]);
    expect(screen.getByText('00:01:00')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText('00:00:59')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Reset' })[1]);
    expect(screen.getByLabelText('Menit')).toBeInTheDocument();
  });
});
