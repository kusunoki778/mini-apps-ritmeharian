import { ArrowRight, NotePencil, PushPin } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Note } from '@/lib/db/db';
import { formatNoteTime } from '@/features/notes/note-format';
import { NoteEditorSheet } from '@/features/notes/NoteEditorSheet';
import { useRecentNotes } from '@/features/notes/useNotes';

export function NotesCard() {
  const notes = useRecentNotes(2);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setEditorOpen(true);
  };

  return (
    <section aria-labelledby="catatan-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="catatan-heading" className="text-base font-semibold">
          Catatan terakhir
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openCreate}>
            <NotePencil size={16} aria-hidden="true" />
            Catatan baru
          </Button>
          <Link
            to="/catatan"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
          >
            Semua catatan <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {notes === undefined ? (
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      ) : notes.length === 0 ? (
        <Card className="p-5 text-sm leading-relaxed text-ink-muted">
          Belum ada catatan. Tulis satu hal yang ingin kamu ingat.
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => openEdit(note)}
                  className="flex w-full items-start gap-3 px-5 py-4 text-left"
                >
                  <NotePencil
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ink-muted"
                  />
                  <span className="min-w-0 flex-1">
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
                    <span className="mt-0.5 line-clamp-1 block text-[12px] text-ink-muted">
                      {note.body}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] text-ink-muted">
                    {formatNoteTime(note.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editorOpen ? (
        <NoteEditorSheet note={editing} onClose={() => setEditorOpen(false)} />
      ) : null}
    </section>
  );
}
