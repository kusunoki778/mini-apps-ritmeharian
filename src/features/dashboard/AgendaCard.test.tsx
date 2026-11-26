import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { db } from '@/lib/db/db';
import { AgendaCard } from './AgendaCard';

function renderCard() {
  return render(
    <MemoryRouter>
      <AgendaCard />
    </MemoryRouter>,
  );
}

describe('AgendaCard', () => {
  beforeEach(async () => {
    await db.events.clear();
  });

  it('menyembunyikan agenda yang sudah lewat', async () => {
    const now = Date.now();
    await db.events.bulkAdd([
      {
        id: 'past',
        title: 'Sudah lewat',
        start: now - 5 * 60 * 1000,
        end: null,
        allDay: false,
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'next',
        title: 'Berikutnya',
        start: now + 60 * 60 * 1000,
        end: null,
        allDay: false,
        createdAt: 0,
        updatedAt: 0,
      },
    ]);

    renderCard();

    expect(await screen.findByText('Berikutnya')).toBeInTheDocument();
    expect(screen.queryByText('Sudah lewat')).not.toBeInTheDocument();
  });

  it('menampilkan paling banyak tiga agenda', async () => {
    const now = Date.now();
    await db.events.bulkAdd(
      [1, 2, 3, 4].map((index) => ({
        id: `e${index}`,
        title: `Agenda ${index}`,
        start: now + index * 60 * 60 * 1000,
        end: null,
        allDay: false,
        createdAt: 0,
        updatedAt: 0,
      })),
    );

    renderCard();

    const list = await screen.findByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });
});
