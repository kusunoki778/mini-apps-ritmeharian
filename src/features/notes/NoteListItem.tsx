import { PushPin, Trash } from '@phosphor-icons/react';

import { IconButton } from '@/components/ui/IconButton';
import type { Note } from '@/lib/db/db';
import { formatNoteTime } from './note-format';

interface NoteListItemProps {
  note: Note;
  onOpen: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteListItem({ note, onOpen, onTogglePin, onDelete }: NoteListItemProps) {
  return (
    <li className="flex items-start gap-2 px-4 py-4 sm:px-5">
      <button
        type="button"
        onClick={() => onOpen(note)}
        className="min-w-0 flex-1 rounded-control text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{note.title}</span>
          {note.pinned ? (
            <PushPin
              size={13}
              weight="fill"
              aria-label="Disematkan"
              className="shrink-0 text-accent"
            />
          ) : null}
        </span>
        <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-ink-muted">
          {note.body}
        </span>
        <span className="mt-1.5 block text-[12px] text-ink-muted">
          {formatNoteTime(note.updatedAt)}
        </span>
      </button>

      <div className="flex shrink-0">
        <IconButton
          label={note.pinned ? `Lepas pin ${note.title}` : `Pin ${note.title}`}
          size="sm"
          onClick={() => onTogglePin(note)}
        >
          <PushPin
            size={16}
            weight={note.pinned ? 'fill' : 'regular'}
            aria-hidden="true"
            className={note.pinned ? 'text-accent' : undefined}
          />
        </IconButton>
        <IconButton label={`Hapus ${note.title}`} size="sm" onClick={() => onDelete(note)}>
          <Trash size={16} aria-hidden="true" />
        </IconButton>
      </div>
    </li>
  );
}
