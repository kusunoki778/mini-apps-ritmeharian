import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-card border border-line bg-surface', className)}>{children}</div>
  );
}
