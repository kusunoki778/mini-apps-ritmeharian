import { Plus, Trash } from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import type { CalendarEvent } from '@/lib/db/db';
import { formatEventTime, fullDateLabel } from './calendar-utils';

interface DayPanelProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

export function DayPanel({ date, events, onClose, onAdd, onEdit, onDelete }: DayPanelProps) {
  return (
    <Sheet
      open
      onClose={onClose}
      title={fullDateLabel(date)}
      description={
        events.length > 0 ? `${events.length} agenda di hari ini.` : 'Belum ada agenda di hari ini.'
      }
      footer={
        <Button onClick={onAdd}>
          <Plus size={16} aria-hidden="true" />
          Tambah agenda
        </Button>
      }
    >
      {events.length === 0 ? (
        <p className="text-sm leading-relaxed text-ink-muted">
          Belum ada agenda di hari ini. Tekan Tambah agenda untuk mengisi.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {events.map((event) => (
            <li key={event.id} className="flex items-start gap-2 py-3">
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="min-w-0 flex-1 rounded-control text-left"
              >
                <span className="tabular block text-[13px] font-medium text-ink-muted">
                  {formatEventTime(event)}
                </span>
                <span className="mt-0.5 block text-sm font-medium">{event.title}</span>
                {event.note ? (
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">
                    {event.note}
                  </span>
                ) : null}
              </button>
              <IconButton label={`Hapus ${event.title}`} size="sm" onClick={() => onDelete(event)}>
                <Trash size={16} aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
