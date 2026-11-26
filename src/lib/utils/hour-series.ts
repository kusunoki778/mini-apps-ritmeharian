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
