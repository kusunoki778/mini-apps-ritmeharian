import { useId, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Select({ label, error, hint, id, className, children, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-[13px] font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          'min-h-11 w-full rounded-control border bg-surface px-3 text-sm',
          error ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
