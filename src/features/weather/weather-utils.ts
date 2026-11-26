const TIME_PATTERN = /T(\d{2}):(\d{2})/;

export function formatClock(iso: string): string {
  const match = TIME_PATTERN.exec(iso);
  return match ? `${match[1]}.${match[2]}` : iso;
}

export function formatUpdatedAt(timestamp: number): string {
  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp));

  return `Diperbarui ${time}`;
}

export function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(iso));
}

export function formatDayShort(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(iso));
}

export function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function hourIsDaylight(timeIso: string, sunrise: string[], sunset: string[]): boolean {
  const date = timeIso.slice(0, 10);
  const index = sunrise.findIndex((value) => value.slice(0, 10) === date);
  if (index === -1 || !sunrise[index] || !sunset[index]) return true;

  return timeIso >= sunrise[index] && timeIso < sunset[index];
}

function localHourIso(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:00`;
}

export function currentHourIndex(times: string[], now: Date): number {
  const key = localHourIso(now);
  const index = times.findIndex((time) => time >= key);

  return index === -1 ? Math.max(0, times.length - 1) : index;
}
