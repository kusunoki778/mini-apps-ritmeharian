import { X } from '@phosphor-icons/react';

import { cn } from '@/lib/utils/cn';
import { useToastStore, type ToastVariant } from './toast-store';

const VARIANT_STYLES: Record<ToastVariant, string> = {
  info: 'border-line',
  success: 'border-accent',
  error: 'border-danger',
};

export function Toaster() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 md:bottom-6"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card border bg-surface p-3 shadow-lg',
            VARIANT_STYLES[item.variant],
          )}
        >
          <p className="flex-1 text-sm">{item.message}</p>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => dismiss(item.id)}
            className="text-ink-muted hover:text-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
