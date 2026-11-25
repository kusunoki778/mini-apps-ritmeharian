import { Info } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface BannerProps {
  children: ReactNode;
  variant?: 'info' | 'warning';
  action?: ReactNode;
}

export function Banner({ children, variant = 'info', action }: BannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-card border px-4 py-3 text-sm',
        variant === 'warning' ? 'border-danger bg-danger-soft' : 'border-line bg-surface',
      )}
    >
      <Info size={18} aria-hidden="true" className="shrink-0 text-ink-muted" />
      <p className="flex-1 text-ink">{children}</p>
      {action}
    </div>
  );
}
