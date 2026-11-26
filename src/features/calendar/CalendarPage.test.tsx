import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/db';
import { renderWithProviders as render } from '@/test/render';
import CalendarPage from './CalendarPage';
import { fullDateLabel } from './calendar-utils';

const today = new Date();

describe('CalendarPage', () => {
  beforeEach(async () => {
    await db.events.clear();
  });

  it('menampilkan grid bulan dan berpindah bulan', async () => {
    render(<CalendarPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Kalender' })).toBeInTheDocument();
    const currentMonth = screen.getByRole('heading', { level: 2 }).textContent;

    await userEvent.click(screen.getByRole('button', { name: 'Bulan berikutnya' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(currentMonth),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Hari ini' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(currentMonth),
    );
  });

  it('membuka panel hari dan menambah agenda', async () => {
    render(<CalendarPage />);

    await userEvent.click(screen.getByRole('button', { name: fullDateLabel(today) }));
    expect(await screen.findByRole('heading', { name: fullDateLabel(today) })).toBeInTheDocument();
    expect(screen.getByText('Belum ada agenda di hari ini.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tambah agenda' }));
    await userEvent.type(screen.getByLabelText('Judul'), 'Rapat pagi');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() => expect(screen.queryByLabelText('Judul')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: fullDateLabel(today) }));
    expect(await screen.findByText('Rapat pagi')).toBeInTheDocument();
  });

  it('menghapus agenda dari panel hari', async () => {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).getTime();
    await db.events.add({
      id: 'e1',
      title: 'Rapat pagi',
      start,
      end: null,
      allDay: false,
      createdAt: 0,
      updatedAt: 0,
    });

    render(<CalendarPage />);

    await userEvent.click(screen.getByRole('button', { name: fullDateLabel(today) }));
    await screen.findByText('Rapat pagi');

    await userEvent.click(screen.getByRole('button', { name: 'Hapus Rapat pagi' }));
    await screen.findByRole('heading', { name: 'Hapus agenda?' });
    await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));

    await waitFor(() => expect(screen.queryByText('Rapat pagi')).not.toBeInTheDocument());
  });
});
