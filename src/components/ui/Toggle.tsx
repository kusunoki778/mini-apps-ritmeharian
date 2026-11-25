import { useId } from 'react';

import { cn } from '@/lib/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p id={labelId} className="text-sm font-medium">
          {label}
        </p>
        {description ? <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
          checked ? 'border-accent bg-accent' : 'border-line bg-paper',
          disabled && 'opacity-50',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'ml-0.5 size-5 rounded-full bg-surface shadow transition-transform',
            checked ? 'translate-x-5 bg-paper' : 'translate-x-0 bg-ink-muted',
          )}
        />
      </button>
    </div>
  );
}
