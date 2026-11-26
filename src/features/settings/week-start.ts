export type WeekStart = 0 | 1;

export const WEEK_START_STORAGE_KEY = 'nadi-week-start';

// Default Senin. Nilai lama dibaca sekali untuk memindahkannya ke tabel settings.
export function readWeekStart(): WeekStart {
  try {
    return localStorage.getItem(WEEK_START_STORAGE_KEY) === '0' ? 0 : 1;
  } catch {
    return 1;
  }
}

export function writeWeekStart(value: WeekStart): void {
  try {
    localStorage.setItem(WEEK_START_STORAGE_KEY, String(value));
  } catch {
    // Penyimpanan tidak tersedia, nilai default tetap dipakai.
  }
}
