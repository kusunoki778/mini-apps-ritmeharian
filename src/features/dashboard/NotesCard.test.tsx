import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { db } from '@/lib/db/db';
import { NotesCard } from './NotesCard';

describe('NotesCard', () => {
  beforeEach(async () => {
    await db.notes.clear();
  });

  it('menampilkan state kosong dan bisa menambah catatan cepat', async () => {
    render(
      <MemoryRouter>
        <NotesCard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Belum ada catatan. Tulis satu hal yang ingin kamu ingat.'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Catatan baru' }));
    await userEvent.type(screen.getByLabelText('Judul'), 'Pesan cepat');
    await userEvent.type(screen.getByLabelText('Isi'), 'Beli susu');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Pesan cepat')).toBeInTheDocument();
  });

  it('menampilkan paling banyak dua catatan', async () => {
    const now = Date.now();
    for (let index = 0; index < 3; index += 1) {
      await db.notes.add({
        id: `n${index}`,
        title: `Catatan ${index}`,
        body: 'isi',
        pinned: 0,
        createdAt: now,
        updatedAt: now + index,
      });
    }

    render(
      <MemoryRouter>
        <NotesCard />
      </MemoryRouter>,
    );

    await screen.findByText('Catatan 2');
    const list = screen.getByRole('list');
    expect(list.querySelectorAll('li')).toHaveLength(2);
  });
});
