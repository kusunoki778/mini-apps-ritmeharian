import { useTheme } from './useTheme';
import type { ThemePreference } from './theme';

const OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="group"
      aria-label="Tema tampilan"
      className="inline-flex rounded-control border border-line bg-surface p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setPreference(option.value)}
            className={`min-h-11 rounded-[7px] px-4 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent text-paper'
                : 'text-ink-muted hover:bg-paper hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
