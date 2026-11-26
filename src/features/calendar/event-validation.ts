import type { EventInput } from './events-repo';

export interface EventErrors {
  title?: string;
  date?: string;
  endTime?: string;
}

export function validateEvent(input: EventInput): EventErrors {
  const errors: EventErrors = {};

  if (!input.title.trim()) {
    errors.title = 'Judul wajib diisi.';
  }

  if (!input.date.trim()) {
    errors.date = 'Tanggal wajib diisi.';
  }

  if (!input.allDay && input.startTime && input.endTime && input.endTime <= input.startTime) {
    errors.endTime = 'Waktu selesai harus setelah waktu mulai.';
  }

  return errors;
}

export function hasEventErrors(errors: EventErrors): boolean {
  return Boolean(errors.title || errors.date || errors.endTime);
}
