import { Button } from '@/components/ui/Button';
import { useModalDialog } from '@/components/ui/useModalDialog';

interface RingScreenProps {
  kind: string;
  time: string;
  title: string;
  snoozeLabel?: string;
  onSnooze?: () => void;
  onDismiss: () => void;
  hint?: string;
}

// Layar penuh saat sesuatu berbunyi: alarm atau pengingat agenda. Sama untuk
// keduanya supaya perilaku konsisten.
export function RingScreen({
  kind,
  time,
  title,
  snoozeLabel,
  onSnooze,
  onDismiss,
  hint = 'Sekarang waktunya. Tunda atau matikan.',
}: RingScreenProps) {
  const { ref } = useModalDialog(true, onDismiss);

  return (
    <dialog
      ref={ref}
      aria-label={`${kind} ${title}`}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-0 text-ink backdrop:bg-black/60"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ink-muted">{kind}</p>
        <p className="tabular text-6xl font-bold tracking-tight md:text-7xl">{time}</p>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-ink-muted">{hint}</p>

        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          {snoozeLabel && onSnooze ? (
            <Button variant="secondary" onClick={onSnooze}>
              {snoozeLabel}
            </Button>
          ) : null}
          <Button onClick={onDismiss}>Matikan</Button>
        </div>
      </div>
    </dialog>
  );
}
