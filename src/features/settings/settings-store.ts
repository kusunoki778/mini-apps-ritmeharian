import { create } from 'zustand';

import { setFormatPreferences } from '@/lib/format/preferences';
import { DEFAULT_SETTINGS, type Settings } from './settings';
import { readSettings, writeSettings } from './settings-repo';
import { getStoredTheme } from './theme';
import { readWeekStart } from './week-start';

interface SettingsState {
  settings: Settings;
  update: (partial: Partial<Settings>) => void;
  reload: () => Promise<void>;
}

// Nilai dari localStorage dipakai lebih dulu supaya paint pertama tidak menunggu Dexie.
function readBootSettings(): Settings {
  return {
    ...DEFAULT_SETTINGS,
    theme: getStoredTheme(),
    weekStart: readWeekStart(),
  };
}

const bootSettings = readBootSettings();

setFormatPreferences({
  clockFormat: bootSettings.clockFormat,
  temperatureUnit: bootSettings.temperatureUnit,
});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: bootSettings,
  update: (partial) => {
    const next = { ...get().settings, ...partial };
    set({ settings: next });
    void writeSettings(next);
  },
  // Membaca Dexie sekali lalu menulis kembali, yang sekaligus memindahkan nilai lama dari localStorage.
  reload: async () => {
    const stored = await readSettings();
    const next = { ...get().settings, ...stored };
    set({ settings: next });
    void writeSettings(next);
  },
}));
