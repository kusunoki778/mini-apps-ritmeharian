import { EmptyPanel } from '@/components/ui/EmptyPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NotesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="M5"
        title="Catatan"
        description="Catatan cepat dengan pencarian dan pin. Belum aktif pada M0."
      />
      <EmptyPanel
        title="Catatan belum tersedia"
        description="Data catatan lama tetap aman di riwayat git. Modul baru memakai IndexedDB dan masuk di M5."
      />
    </div>
  );
}
