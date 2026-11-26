import { SegmentedControl, type SegmentOption } from '@/components/ui/SegmentedControl';
import type { ThemePreference } from './theme';
import { useTheme } from './useTheme';

const OPTIONS: SegmentOption<ThemePreference>[] = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <SegmentedControl
      label="Tema tampilan"
      value={preference}
      options={OPTIONS}
      onChange={setPreference}
    />
  );
}
