import { PageHeader } from '@/components/ui/PageHeader';
import { CalendarBoard } from '@/features/calendar/CalendarBoard';
import { NotesBoard } from '@/features/notes/NotesBoard';

// Halaman gabungan: agenda bulanan di atas, catatan di bawah. Menggantikan halaman
// Kalender dan Catatan yang sebelumnya terpisah.
export default function JournalPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Catatan"
        title="Agenda dan catatan"
        description="Atur jadwal di kalender, tulis catatan di bawahnya. Agenda bisa dipasangi nada dering. Semua tersimpan di perangkat ini."
      />

      <CalendarBoard />

      <div className="mt-10">
        <NotesBoard />
      </div>
    </div>
  );
}
