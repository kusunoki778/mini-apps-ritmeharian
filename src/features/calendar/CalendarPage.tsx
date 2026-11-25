import { EmptyPanel } from '@/components/ui/EmptyPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        eyebrow="M6"
        title="Kalender"
        description="Agenda bulanan dan acara lokal. Belum aktif pada M0."
      />
      <EmptyPanel
        title="Kalender belum tersedia"
        description="Grid bulanan, panel hari, dan form agenda masuk di M6. Sampai saat itu, halaman ini sengaja kosong."
      />
    </div>
  );
}
