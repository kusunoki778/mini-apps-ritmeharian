import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { setFormatPreferences } from '@/lib/format/preferences';
import { SettingsContext } from './settings-context';
import { useSettingsStore } from './settings-store';
import { applyResolvedTheme, resolveTheme, storeTheme, type ThemePreference } from './theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSettingsStore((state) => state.settings);
  const update = useSettingsStore((state) => state.update);
  const reload = useSettingsStore((state) => state.reload);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches,
  );

  useEffect(() => {
    void useSettingsStore.getState().reload();
  }, []);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = resolveTheme(settings.theme, systemPrefersDark);

  // Disinkronkan sebelum anak merender supaya fungsi format murni memakai nilai terbaru.
  setFormatPreferences({
    clockFormat: settings.clockFormat,
    temperatureUnit: settings.temperatureUnit,
  });

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    storeTheme(settings.theme);
  }, [settings.theme]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings: update,
      resolvedTheme,
      setTheme: (preference: ThemePreference) => update({ theme: preference }),
      reloadFromStorage: reload,
    }),
    [settings, update, resolvedTheme, reload],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
