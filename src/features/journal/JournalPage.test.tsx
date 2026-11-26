import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/db';
import { fullDateLabel, monthLabel } from '@/features/calendar/calendar-utils';
import { renderWithProviders as render } from '@/test/render';
import JournalPage from './JournalPage';

const today = new Date();

async function addNote(title: string, body: string) {
  await userEvent.click(screen.getAllByRole('button', { name: 'Catatan baru' })[0]);
  await userEvent.type(screen.getByLabelText('Judul'), title);
  await userEvent.type(screen.getByLabelText('Isi'), body);
  await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
}

describe('JournalPage', () => {
  beforeEach(async () => {
    await db.notes.clear();
    await db.events.clear();
  });

  it('menampilkan agenda lebih dulu lalu catatan dalam satu halaman', () => {
    render(<JournalPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Agenda dan catatan' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Catatan' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: monthLabel(new Date()) }),
    ).toBeInTheDocument();
  });

  it('menambah dan mencari catatan', async () => {
    render(<JournalPage />);

    expect(await screen.findByText('Belum ada catatan')).toBeInTheDocument();

    await addNote('Belanja', 'Susu dan telur');

    expect(await screen.findByText('Belanja')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Cari catatan'), 'xyz');
    await waitFor(() => expect(screen.getByText('Tidak ada hasil')).toBeInTheDocument());
  });

  it('membuat agenda dengan nada dering dan menyimpan pengingatnya', async () => {
    render(<JournalPage />);

    await userEvent.click(screen.getByRole('button', { name: fullDateLabel(today) }));
    await userEvent.click(await screen.findByRole('button', { name: 'Tambah agenda' }));

    await userEvent.type(screen.getByLabelText('Judul'), 'Rapat penting');
    await userEvent.click(screen.getByRole('switch', { name: 'Pasang nada dering' }));
    await userEvent.selectOptions(screen.getByLabelText('Kapan berbunyi'), '15');
    await userEvent.selectOptions(screen.getByLabelText('Nada dering'), 'tegas');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(async () => {
      const events = await db.events.toArray();
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Rapat penting');
      expect(events[0].reminderMinutes).toBe(15);
      expect(events[0].reminderSoundId).toBe('tegas');
    });
  });

  it('menghapus agenda lewat panel hari', async () => {
    const now = new Date();
    await db.events.add({
      id: 'hapus',
      title: 'Agenda hapus',
      start: now.getTime(),
      end: null,
      allDay: false,
      createdAt: now.getTime(),
      updatedAt: now.getTime(),
    });

    render(<JournalPage />);

    await userEvent.click(screen.getByRole('button', { name: fullDateLabel(now) }));
    expect(await screen.findByText('Agenda hapus')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hapus Agenda hapus' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus' }));

    await waitFor(() =>
      expect(screen.getByText('Belum ada agenda di hari ini.')).toBeInTheDocument(),
    );
  });
});
