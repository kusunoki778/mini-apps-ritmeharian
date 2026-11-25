import { EmptyPanel } from '@/components/ui/EmptyPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AlarmsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="M7"
        title="Alarm"
        description="Alarm lokal dengan pengulangan. Belum aktif pada M0."
      />
      <EmptyPanel
        title="Alarm belum tersedia"
        description="Alarm berbunyi selama Nadi terbuka. Alarm latar belakang memerlukan pembungkus native dan masuk backlog setelah v1."
      />
    </div>
  );
}
