import type { ReactNode } from 'react';

interface EmptyPanelProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyPanel({ title, description, children }: EmptyPanelProps) {
  return (
    <section className="rounded-card border border-line bg-surface p-6 md:p-8">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
