import { useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast-store';
import { readLocation } from '@/features/location/location-storage';
import { useLocationStore } from '@/features/location/location-store';
import { DeleteDataDialog } from './DeleteDataDialog';
import {
  buildExport,
  clearAllData,
  clearLocalPreferences,
  downloadExport,
  exportFilename,
  importFromText,
  MAX_IMPORT_BYTES,
} from './export-import';
import { useSettings } from './useSettings';

export function DataSection() {
  const { reloadFromStorage } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      downloadExport(await buildExport(), exportFilename());
      toast('Data diekspor ke berkas JSON.', 'success');
    } catch {
      toast('Ekspor gagal. Coba lagi.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_IMPORT_BYTES) {
      toast('Berkas terlalu besar. Batas 5 MB.', 'error');
      return;
    }

    setBusy(true);
    try {
      const summary = await importFromText(await file.text());
      useLocationStore.getState().setLocation(readLocation());
      await reloadFromStorage();
      toast(
        `Impor selesai: ${summary.notes} catatan, ${summary.events} agenda, ${summary.alarms} alarm.`,
        'success',
      );
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Impor gagal.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await clearAllData();
      clearLocalPreferences();
      toast('Semua data dihapus.', 'success');
      window.location.reload();
    } catch {
      toast('Gagal menghapus data.', 'error');
      setBusy(false);
    }
  };

  return (
    <>
      <p className="text-sm leading-relaxed text-ink-muted">
        Ekspor seluruh data ke satu berkas JSON, atau impor kembali. Impor menimpa data yang ada di
        perangkat ini.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void handleExport()} disabled={busy}>
          Ekspor JSON
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
          Impor JSON
        </Button>
        <Button variant="danger" onClick={() => setDeleteOpen(true)} disabled={busy}>
          Hapus semua data
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          aria-label="Berkas JSON untuk impor"
          className="sr-only"
          onChange={(event) => void handleFile(event)}
        />
      </div>

      <DeleteDataDialog
        open={deleteOpen}
        busy={busy}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
