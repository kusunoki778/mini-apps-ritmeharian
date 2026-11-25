import type { ReactNode } from 'react';

import { Card } from './Card';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-6 md:p-8">
      {icon ? <div className="mb-4 text-ink-muted">{icon}</div> : null}
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
