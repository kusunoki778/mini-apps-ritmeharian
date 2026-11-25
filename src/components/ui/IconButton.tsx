import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'md' | 'sm';
  variant?: 'ghost' | 'secondary';
}

export function IconButton({
  label,
  size = 'md',
  variant = 'ghost',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-control transition-colors',
        size === 'md' ? 'size-11' : 'size-9',
        variant === 'ghost'
          ? 'text-ink-muted hover:bg-accent-soft hover:text-ink'
          : 'border border-line bg-surface text-ink hover:bg-paper',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
