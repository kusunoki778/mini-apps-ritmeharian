import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[13px] font-medium text-ink-muted">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
