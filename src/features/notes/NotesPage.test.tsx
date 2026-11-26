import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db, type Note } from '@/lib/db/db';
import NotesPage from './NotesPage';

async function seed(title: string, body: string, extra: Partial<Note> = {}) {
  const now = Date.now();
  const id = extra.id ?? title.toLowerCase().replace(/\s+/g, '-');

  await db.notes.add({
    id,
    title,
    body,
    pinned: 0,
    createdAt: now,
    updatedAt: now,
    ...extra,
  });

  return id;
}

async function addNote(title: string, body: string) {
  await userEvent.click(screen.getAllByRole('button', { name: 'Catatan baru' })[0]);
  await userEvent.type(screen.getByLabelText('Judul'), title);
  await userEvent.type(screen.getByLabelText('Isi'), body);
  await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
}

describe('NotesPage', () => {
  beforeEach(async () => {
    await db.notes.clear();
  });

  it('menampilkan state kosong lalu bisa menambah catatan', async () => {
    render(<NotesPage />);

    expect(await screen.findByText('Belum ada catatan')).toBeInTheDocument();

    await addNote('Belanja', 'Kopi dan gula');

    expect(await screen.findByText('Belanja')).toBeInTheDocument();
    expect(screen.queryByText('Belum ada catatan')).not.toBeInTheDocument();
  });

  it('mencari judul dan isi tanpa peduli huruf besar kecil', async () => {
    await seed('Belanja', 'Kopi dan gula');
    await seed('Ide Nadi', 'Dasbor harian');
    render(<NotesPage />);

    await screen.findByText('Belanja');
    await userEvent.type(screen.getByLabelText('Cari catatan'), 'NADI');

    await waitFor(() => expect(screen.queryByText('Belanja')).not.toBeInTheDocument());
    expect(screen.getByText('Ide Nadi')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Cari catatan'));
    await userEvent.type(screen.getByLabelText('Cari catatan'), 'gula');
    await waitFor(() => expect(screen.getByText('Belanja')).toBeInTheDocument());
    expect(screen.queryByText('Ide Nadi')).not.toBeInTheDocument();
  });

  it('menampilkan pesan tanpa hasil saat pencarian tidak cocok', async () => {
    await seed('Belanja', 'Kopi dan gula');
    render(<NotesPage />);

    await screen.findByText('Belanja');
    await userEvent.type(screen.getByLabelText('Cari catatan'), 'zzz');

    expect(await screen.findByText('Tidak ada hasil')).toBeInTheDocument();
  });

  it('menyematkan catatan dan menaruhnya di atas', async () => {
    await seed('Pertama', 'x', { updatedAt: 1000 });
    await seed('Kedua', 'y', { updatedAt: 2000 });
    render(<NotesPage />);

    const list = await screen.findByRole('list');
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Kedua');

    await userEvent.click(screen.getByRole('button', { name: 'Pin Pertama' }));

    await waitFor(() =>
      expect(within(screen.getByRole('list')).getAllByRole('listitem')[0]).toHaveTextContent(
        'Pertama',
      ),
    );
  });

  it('meminta konfirmasi saat menutup editor dengan perubahan', async () => {
    render(<NotesPage />);
    await screen.findByText('Belum ada catatan');

    await userEvent.click(screen.getAllByRole('button', { name: 'Catatan baru' })[0]);
    await userEvent.type(screen.getByLabelText('Judul'), 'Draft');
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));

    expect(await screen.findByRole('heading', { name: 'Buang perubahan?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Buang' }));

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Buang perubahan?' })).not.toBeInTheDocument(),
    );
  });

  it('menghapus catatan lewat dialog konfirmasi dengan fokus di Batal', async () => {
    await seed('Belanja', 'Kopi dan gula');
    render(<NotesPage />);

    await screen.findByText('Belanja');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus Belanja' }));

    expect(await screen.findByRole('heading', { name: 'Hapus catatan?' })).toBeInTheDocument();

    const cancel = screen.getByRole('button', { name: 'Batal' });
    await waitFor(() => expect(cancel).toHaveFocus());

    await userEvent.click(cancel);
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Hapus catatan?' })).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Belanja')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hapus Belanja' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus' }));

    await waitFor(() => expect(screen.queryByText('Belanja')).not.toBeInTheDocument());
    expect(await screen.findByText('Belum ada catatan')).toBeInTheDocument();
  });
});
