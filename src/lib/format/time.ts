import { getClockFormat, type ClockFormat } from './preferences';

export function formatClockParts(
  hour: number,
  minute: number,
  format: ClockFormat = getClockFormat(),
): string {
  const paddedMinute = String(minute).padStart(2, '0');

  if (format === '24h') {
    return `${String(hour).padStart(2, '0')}.${paddedMinute}`;
  }

  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${String(hour12).padStart(2, '0')}.${paddedMinute} ${period}`;
}

export function formatTimeOfDay(date: Date, format: ClockFormat = getClockFormat()): string {
  return formatClockParts(date.getHours(), date.getMinutes(), format);
}
