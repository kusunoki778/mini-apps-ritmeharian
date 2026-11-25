import { useId, type ReactNode } from 'react';

import { useModalDialog } from './useModalDialog';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, onClose, title, description, children, footer }: DialogProps) {
  const { ref, handleBackdropClick } = useModalDialog(open, onClose);
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,32rem)] rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/50"
    >
      <div className="p-5 md:p-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </dialog>
  );
}
