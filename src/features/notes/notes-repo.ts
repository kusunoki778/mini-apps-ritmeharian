import { db, type Note } from '@/lib/db/db';
import { createId } from '@/lib/utils/id';

export const NOTE_TITLE_MAX = 80;
export const NOTE_BODY_MAX = 5000;

export interface NoteInput {
  title: string;
  body: string;
}

// Pin lebih dulu, lalu waktu diubah terbaru. Array dibuat baru agar pemanggil tidak mengubah sumber.
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return b.updatedAt - a.updatedAt;
  });
}

export function filterNotes(notes: Note[], query: string): Note[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return notes;

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(needle) || note.body.toLowerCase().includes(needle),
  );
}

export async function listNotes(): Promise<Note[]> {
  return sortNotes(await db.notes.toArray());
}

export async function searchNotes(query: string): Promise<Note[]> {
  return filterNotes(await listNotes(), query);
}

export async function getRecentNotes(limit = 2): Promise<Note[]> {
  return (await listNotes()).slice(0, limit);
}

export async function createNote(input: NoteInput): Promise<string> {
  const now = Date.now();
  const id = createId();

  await db.notes.add({
    id,
    title: input.title.trim(),
    body: input.body.trim(),
    pinned: 0,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateNote(id: string, input: NoteInput): Promise<void> {
  await db.notes.update(id, {
    title: input.title.trim(),
    body: input.body.trim(),
    updatedAt: Date.now(),
  });
}

export async function setPinned(id: string, pinned: boolean): Promise<void> {
  await db.notes.update(id, { pinned: pinned ? 1 : 0 });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}
