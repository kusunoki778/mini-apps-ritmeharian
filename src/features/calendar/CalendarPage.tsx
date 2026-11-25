import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        eyebrow="M6"
        title="Kalender"
        description="Agenda bulanan dan acara lokal. Belum aktif."
      />
      <EmptyState
        title="Kalender belum tersedia"
        description="Grid bulanan, panel hari, dan form agenda masuk di M6. Sampai saat itu, halaman ini sengaja kosong."
      />
    </div>
  );
}
