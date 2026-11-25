import { WarningCircle } from '@phosphor-icons/react';

import { Button } from './Button';
import { Card } from './Card';

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Ada yang tidak beres',
  description,
  onRetry,
  retryLabel = 'Coba lagi',
}: ErrorStateProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <WarningCircle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{description}</p>
          {onRetry ? (
            <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
