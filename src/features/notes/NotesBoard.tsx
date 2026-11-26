import { MagnifyingGlass, NotePencil } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toast-store';
import type { Note } from '@/lib/db/db';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { DeleteNoteDialog } from './DeleteNoteDialog';
import { NoteEditorSheet } from './NoteEditorSheet';
import { NoteListItem } from './NoteListItem';
import { deleteNote, setPinned } from './notes-repo';
import { useNotes } from './useNotes';

// Daftar catatan tanpa judul halaman, dipakai halaman gabungan Catatan dan agenda.
export function NotesBoard() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);
  const notes = useNotes(debouncedQuery);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);

  const searching = debouncedQuery.trim().length > 0;

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setEditorOpen(true);
  };

  const handleTogglePin = async (note: Note) => {
    await setPinned(note.id, note.pinned === 0);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, title } = pendingDelete;
    await deleteNote(id);
    setPendingDelete(null);
    toast(`Catatan "${title}" dihapus.`, 'success');
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Catatan</h2>
        <Button onClick={openCreate}>
          <NotePencil size={18} aria-hidden="true" />
          Catatan baru
        </Button>
      </div>

      <div className="mb-5 max-w-md">
        <Input
          label="Cari catatan"
          type="search"
          placeholder="Cari judul atau isi"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {notes === undefined ? (
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </Card>
      ) : notes.length === 0 ? (
        searching ? (
          <EmptyState
            icon={<MagnifyingGlass size={24} aria-hidden="true" />}
            title="Tidak ada hasil"
            description={`Tidak ada catatan yang cocok dengan "${debouncedQuery}".`}
          />
        ) : (
          <EmptyState
            icon={<NotePencil size={24} aria-hidden="true" />}
            title="Belum ada catatan"
            description="Tulis satu hal yang ingin kamu ingat."
            action={<Button onClick={openCreate}>Catatan baru</Button>}
          />
        )
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                onOpen={openEdit}
                onTogglePin={(item) => void handleTogglePin(item)}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        </Card>
      )}

      {editorOpen ? <NoteEditorSheet note={editing} onClose={() => setEditorOpen(false)} /> : null}

      <DeleteNoteDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete?.title ?? ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
