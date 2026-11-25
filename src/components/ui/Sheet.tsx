import { X } from '@phosphor-icons/react';
import { useId, type ReactNode } from 'react';

import { IconButton } from './IconButton';
import { useModalDialog } from './useModalDialog';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, description, children, footer }: SheetProps) {
  const { ref, handleBackdropClick } = useModalDialog(open, onClose);
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      className="m-0 mt-auto w-full max-w-none rounded-t-[20px] border border-line bg-surface p-0 text-ink backdrop:bg-black/50 sm:m-auto sm:w-[min(92vw,32rem)] sm:rounded-card"
    >
      <div className="max-h-[85dvh] overflow-y-auto p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>
            ) : null}
          </div>
          <IconButton label="Tutup" size="sm" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div> : null}
      </div>
    </dialog>
  );
}
