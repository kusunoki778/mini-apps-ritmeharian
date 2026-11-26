const TIME = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function daysBetween(a: Date, b: Date): number {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(a) - startOfDay(b)) / day);
}

export function formatNoteTime(timestamp: number, now: Date = new Date()): string {
  const date = new Date(timestamp);
  const diff = daysBetween(now, date);

  if (diff === 0) return `Hari ini, ${TIME.format(date)}`;
  if (diff === 1) return `Kemarin, ${TIME.format(date)}`;
  if (diff === -1) return `Besok, ${TIME.format(date)}`;

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
