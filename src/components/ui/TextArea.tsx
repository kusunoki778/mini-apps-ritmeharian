import { useId, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, id, className, ...props }: TextAreaProps) {
  const autoId = useId();
  const areaId = id ?? autoId;
  const messageId = error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={areaId} className="block text-[13px] font-medium">
        {label}
      </label>
      <textarea
        id={areaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          'min-h-28 w-full rounded-control border bg-surface px-3 py-2 text-sm placeholder:text-ink-muted/70',
          error ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${areaId}-error`} className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${areaId}-hint`} className="text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
