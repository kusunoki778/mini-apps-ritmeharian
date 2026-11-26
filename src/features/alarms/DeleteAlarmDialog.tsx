import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface DeleteAlarmDialogProps {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAlarmDialog({ open, label, onCancel, onConfirm }: DeleteAlarmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Hapus alarm?"
      description={`Alarm "${label}" akan dihapus dari perangkat ini dan tidak bisa dikembalikan.`}
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
