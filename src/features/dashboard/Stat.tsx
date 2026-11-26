import type { ReactNode } from 'react';

export function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-muted" aria-hidden="true">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-[12px] text-ink-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
