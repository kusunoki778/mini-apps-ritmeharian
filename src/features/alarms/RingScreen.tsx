import { Button } from '@/components/ui/Button';
import { useModalDialog } from '@/components/ui/useModalDialog';
import type { Alarm } from '@/lib/db/db';
import { formatAlarmTime } from './alarm-utils';

interface RingScreenProps {
  alarm: Alarm;
  onSnooze: () => void;
  onDismiss: () => void;
}

export function RingScreen({ alarm, onSnooze, onDismiss }: RingScreenProps) {
  const { ref } = useModalDialog(true, onDismiss);

  return (
    <dialog
      ref={ref}
      aria-label={`Alarm ${alarm.label}`}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-0 text-ink backdrop:bg-black/60"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ink-muted">Alarm</p>
        <p className="tabular text-6xl font-bold tracking-tight md:text-7xl">
          {formatAlarmTime(alarm.hour, alarm.minute)}
        </p>
        <h2 className="text-xl font-semibold">{alarm.label}</h2>
        <p className="text-sm text-ink-muted">Sekarang waktunya. Tunda atau matikan.</p>

        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <Button variant="secondary" onClick={onSnooze}>
            Tunda {alarm.snoozeMinutes} menit
          </Button>
          <Button onClick={onDismiss}>Matikan</Button>
        </div>
      </div>
    </dialog>
  );
}
