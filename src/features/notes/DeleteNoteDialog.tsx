import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface DeleteNoteDialogProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteNoteDialog({ open, title, onCancel, onConfirm }: DeleteNoteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Hapus catatan?"
      description={`Catatan "${title}" akan dihapus dari perangkat ini dan tidak bisa dikembalikan.`}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Hapus
          </Button>
        </>
      }
    />
  );
}
