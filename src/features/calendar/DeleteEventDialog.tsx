import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface DeleteEventDialogProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteEventDialog({ open, title, onCancel, onConfirm }: DeleteEventDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Hapus agenda?"
      description={`Agenda "${title}" akan dihapus dari perangkat ini dan tidak bisa dikembalikan.`}
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
