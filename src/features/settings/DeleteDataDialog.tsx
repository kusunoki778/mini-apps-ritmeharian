import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

const KEYWORD = 'HAPUS';

interface DeleteDataDialogProps {
  open: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDataDialog({ open, busy, onCancel, onConfirm }: DeleteDataDialogProps) {
  const [value, setValue] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  const matches = value.trim().toUpperCase() === KEYWORD;

  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const handleConfirm = () => {
    setValue('');
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title="Hapus semua data?"
      description="Catatan, agenda, alarm, dan pengaturan di perangkat ini akan dihapus dan tidak bisa dikembalikan."
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={handleCancel} disabled={busy}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!matches || busy}
            isLoading={busy}
          >
            Hapus permanen
          </Button>
        </>
      }
    >
      <Input
        label={`Ketik ${KEYWORD} untuk konfirmasi`}
        value={value}
        autoComplete="off"
        onChange={(event) => setValue(event.target.value)}
      />
    </Dialog>
  );
}
