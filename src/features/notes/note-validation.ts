import { NOTE_BODY_MAX, NOTE_TITLE_MAX } from './notes-repo';

export interface NoteErrors {
  title?: string;
  body?: string;
}

export function validateNote(title: string, body: string): NoteErrors {
  const errors: NoteErrors = {};

  if (!title.trim()) {
    errors.title = 'Judul wajib diisi.';
  } else if (title.length > NOTE_TITLE_MAX) {
    errors.title = `Judul maksimal ${NOTE_TITLE_MAX} karakter.`;
  }

  if (!body.trim()) {
    errors.body = 'Isi wajib diisi.';
  } else if (body.length > NOTE_BODY_MAX) {
    errors.body = `Isi maksimal ${NOTE_BODY_MAX} karakter.`;
  }

  return errors;
}

export function hasErrors(errors: NoteErrors): boolean {
  return Boolean(errors.title || errors.body);
}
