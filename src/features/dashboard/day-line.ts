const MINUTES_PER_DAY = 24 * 60;

export function dayFraction(now: Date): number {
  const minutes =
    now.getHours() * 60 +
    now.getMinutes() +
    now.getSeconds() / 60 +
    now.getMilliseconds() / 60000;

  return Math.min(1, Math.max(0, minutes / MINUTES_PER_DAY));
}

export function clockFraction(value: string): number | null {
  const match = /^(\d{1,2})[.:](\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return (hours * 60 + minutes) / MINUTES_PER_DAY;
}

export function clockMinutes(value: string): number | null {
  const fraction = clockFraction(value);
  return fraction === null ? null : Math.round(fraction * MINUTES_PER_DAY);
}
