import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import type { Note } from '@/lib/db/db';
import { hasErrors, validateNote, type NoteErrors } from './note-validation';
import { createNote, NOTE_BODY_MAX, NOTE_TITLE_MAX, updateNote } from './notes-repo';

interface NoteEditorSheetProps {
  note: Note | null;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

export function NoteEditorSheet({ note, onClose, onSaved }: NoteEditorSheetProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [errors, setErrors] = useState<NoteErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDirty = note
    ? title !== note.title || body !== note.body
    : title.trim().length > 0 || body.trim().length > 0;

  const requestClose = () => {
    if (saving) return;
    if (isDirty) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  };

  const handleSave = async () => {
    const nextErrors = validateNote(title, body);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      if (note) {
        await updateNote(note.id, { title, body });
        onSaved?.(note.id);
        toast('Catatan diperbarui.', 'success');
      } else {
        const id = await createNote({ title, body });
        onSaved?.(id);
        toast('Catatan disimpan.', 'success');
      }
      onClose();
    } catch {
      toast('Catatan gagal disimpan.', 'error');
      setSaving(false);
    }
  };

  const titleOver = title.length > NOTE_TITLE_MAX;
  const bodyOver = body.length > NOTE_BODY_MAX;

  return (
    <>
      <Sheet
        open
        onClose={requestClose}
        title={note ? 'Ubah catatan' : 'Catatan baru'}
        description="Judul dan isi wajib diisi. Perubahan disimpan ke perangkat ini."
        footer={
          <>
            <Button variant="secondary" onClick={requestClose}>
              Batal
            </Button>
            <Button isLoading={saving} onClick={() => void handleSave()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Judul"
            value={title}
            autoFocus
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
            hint={titleOver ? undefined : `${title.length}/${NOTE_TITLE_MAX}`}
          />
          <TextArea
            label="Isi"
            value={body}
            rows={8}
            onChange={(event) => setBody(event.target.value)}
            error={errors.body}
            hint={bodyOver ? undefined : `${body.length}/${NOTE_BODY_MAX}`}
          />
        </div>
      </Sheet>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Lanjut mengisi
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                onClose();
              }}
            >
              Buang
            </Button>
          </>
        }
      />
    </>
  );
}
