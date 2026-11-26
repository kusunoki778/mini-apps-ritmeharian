import { createContext } from 'react';

import type { Settings } from './settings';
import type { ResolvedTheme, ThemePreference } from './theme';

export interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  resolvedTheme: ResolvedTheme;
  setTheme: (preference: ThemePreference) => void;
  reloadFromStorage: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
