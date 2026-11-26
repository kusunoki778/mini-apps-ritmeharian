import { Trash } from '@phosphor-icons/react';

import { IconButton } from '@/components/ui/IconButton';
import type { Alarm } from '@/lib/db/db';
import { cn } from '@/lib/utils/cn';
import { formatAlarmTime, formatRepeat } from './alarm-utils';

interface AlarmListItemProps {
  alarm: Alarm;
  next: boolean;
  onOpen: (alarm: Alarm) => void;
  onToggle: (alarm: Alarm, enabled: boolean) => void;
  onDelete: (alarm: Alarm) => void;
}

export function AlarmListItem({ alarm, next, onOpen, onToggle, onDelete }: AlarmListItemProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <button
        type="button"
        onClick={() => onOpen(alarm)}
        className="min-w-0 flex-1 rounded-control text-left"
      >
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="tabular text-2xl font-bold tracking-tight">
            {formatAlarmTime(alarm.hour, alarm.minute)}
          </span>
          {next ? (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
              Berikutnya
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-sm font-medium">{alarm.label}</span>
        <span className="mt-0.5 block text-[12px] text-ink-muted">{formatRepeat(alarm)}</span>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          role="switch"
          aria-checked={alarm.enabled}
          aria-label={alarm.enabled ? `Nonaktifkan ${alarm.label}` : `Aktifkan ${alarm.label}`}
          onClick={() => onToggle(alarm, !alarm.enabled)}
          className={cn(
            'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
            alarm.enabled ? 'border-accent bg-accent' : 'border-line bg-paper',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'ml-0.5 size-5 rounded-full shadow transition-transform',
              alarm.enabled ? 'translate-x-5 bg-paper' : 'translate-x-0 bg-ink-muted',
            )}
          />
        </button>
        <IconButton label={`Hapus ${alarm.label}`} size="sm" onClick={() => onDelete(alarm)}>
          <Trash size={16} aria-hidden="true" />
        </IconButton>
      </div>
    </li>
  );
}
