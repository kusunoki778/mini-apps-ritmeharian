import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db/db';
import {
  createNote,
  deleteNote,
  filterNotes,
  getRecentNotes,
  listNotes,
  setPinned,
  sortNotes,
  updateNote,
} from './notes-repo';
import type { Note } from '@/lib/db/db';

const base: Note = {
  id: 'x',
  title: 't',
  body: 'b',
  pinned: 0,
  createdAt: 0,
  updatedAt: 0,
};

describe('sortNotes', () => {
  it('menaruh pin lebih dulu lalu waktu diubah terbaru', () => {
    const notes: Note[] = [
      { ...base, id: 'a', pinned: 0, updatedAt: 300 },
      { ...base, id: 'b', pinned: 1, updatedAt: 100 },
      { ...base, id: 'c', pinned: 0, updatedAt: 200 },
      { ...base, id: 'd', pinned: 1, updatedAt: 400 },
    ];

    expect(sortNotes(notes).map((note) => note.id)).toEqual(['d', 'b', 'a', 'c']);
  });
});

describe('filterNotes', () => {
  const notes: Note[] = [
    { ...base, id: 'a', title: 'Belanja', body: 'Kopi dan gula' },
    { ...base, id: 'b', title: 'Ide', body: 'Dasbor Nadi' },
  ];

  it('mencocokkan judul tanpa peduli huruf besar kecil', () => {
    expect(filterNotes(notes, 'BELANJA').map((note) => note.id)).toEqual(['a']);
  });

  it('mencocokkan isi catatan', () => {
    expect(filterNotes(notes, 'nadi').map((note) => note.id)).toEqual(['b']);
  });

  it('mengembalikan semua saat kueri kosong', () => {
    expect(filterNotes(notes, '   ')).toHaveLength(2);
  });
});

describe('repositori notes', () => {
  beforeEach(async () => {
    await db.notes.clear();
  });

  it('membuat catatan dan memangkas spasi', async () => {
    const id = await createNote({ title: '  Judul  ', body: '  Isi  ' });
    const note = await db.notes.get(id);

    expect(note).toMatchObject({ title: 'Judul', body: 'Isi', pinned: 0 });
    expect(note?.createdAt).toBe(note?.updatedAt);
  });

  it('memperbarui isi dan waktu diubah', async () => {
    const id = await createNote({ title: 'A', body: 'B' });
    await updateNote(id, { title: 'A2', body: 'B2' });
    const note = await db.notes.get(id);

    expect(note?.title).toBe('A2');
    expect(note?.body).toBe('B2');
    expect(note!.updatedAt).toBeGreaterThanOrEqual(note!.createdAt);
  });

  it('menyematkan dan melepas pin', async () => {
    const id = await createNote({ title: 'A', body: 'B' });

    await setPinned(id, true);
    expect((await db.notes.get(id))?.pinned).toBe(1);

    await setPinned(id, false);
    expect((await db.notes.get(id))?.pinned).toBe(0);
  });

  it('menghapus catatan', async () => {
    const id = await createNote({ title: 'A', body: 'B' });
    await deleteNote(id);

    expect(await db.notes.get(id)).toBeUndefined();
  });

  it('mengurutkan pin lalu terbaru lewat listNotes dan getRecentNotes', async () => {
    const first = await createNote({ title: 'Pertama', body: 'x' });
    const second = await createNote({ title: 'Kedua', body: 'y' });
    await setPinned(first, true);

    expect((await listNotes()).map((note) => note.id)).toEqual([first, second]);
    expect((await getRecentNotes(1)).map((note) => note.id)).toEqual([first]);
  });
});
