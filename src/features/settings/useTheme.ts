import { useSettings } from './useSettings';

export function useTheme() {
  const { settings, resolvedTheme, setTheme } = useSettings();

  return {
    preference: settings.theme,
    resolved: resolvedTheme,
    setPreference: setTheme,
  };
}
