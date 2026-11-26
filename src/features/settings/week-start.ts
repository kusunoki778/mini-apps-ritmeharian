const KEY = 'nadi-week-start';

export type WeekStart = 0 | 1;

// Default Senin. Pengaturan awal minggu lewat UI masuk di M8.
export function readWeekStart(): WeekStart {
  try {
    return localStorage.getItem(KEY) === '0' ? 0 : 1;
  } catch {
    return 1;
  }
}

export function writeWeekStart(value: WeekStart): void {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    // Penyimpanan tidak tersedia, nilai default tetap dipakai.
  }
}
