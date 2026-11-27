import { Alarm as AlarmIcon, Plus } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toast-store';
import type { Alarm } from '@/lib/db/db';
import { AlarmBatteryBanner } from './AlarmBatteryBanner';
import { AlarmFormSheet } from './AlarmFormSheet';
import { AlarmPermissionBanner } from './AlarmPermissionBanner';
import { ensureAlarmPermissions } from './alarm-permissions';
import { nativeAlarmsSupported } from './alarm-scheduler';
import { nextTrigger } from './alarm-utils';
import { AlarmListItem } from './AlarmListItem';
import { AlarmTools } from './AlarmTools';
import { deleteAlarm, setAlarmEnabled } from './alarms-repo';
import { DeleteAlarmDialog } from './DeleteAlarmDialog';
import { useAlarms } from './useAlarms';

export default function AlarmsPage() {
  const alarms = useAlarms();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Alarm | null>(null);

  const nextId = useMemo(() => {
    if (!alarms) return null;

    const now = new Date();
    let best: { id: string; at: number } | null = null;

    for (const alarm of alarms) {
      const at = nextTrigger(alarm, now);
      if (at === null) continue;
      if (!best || at < best.at) best = { id: alarm.id, at };
    }

    return best?.id ?? null;
  }, [alarms]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (alarm: Alarm) => {
    setEditing(alarm);
    setFormOpen(true);
  };

  const handleToggle = async (alarm: Alarm, enabled: boolean) => {
    if (enabled && nativeAlarmsSupported()) {
      await ensureAlarmPermissions().catch(() => undefined);
    }
    await setAlarmEnabled(alarm.id, enabled);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, label } = pendingDelete;
    await deleteAlarm(id);
    setPendingDelete(null);
    toast(`Alarm "${label}" dihapus.`, 'success');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Alarm"
        title="Alarm"
        description="Alarm lokal dengan pengulangan. Semua tersimpan di perangkat ini."
        action={
          <Button onClick={openCreate}>
            <Plus size={18} aria-hidden="true" />
            Alarm baru
          </Button>
        }
      />

      <div className="mb-5">
        <Banner>
          {nativeAlarmsSupported()
            ? 'Alarm berbunyi tepat waktu lewat notifikasi sistem, bahkan saat Nadi tertutup.'
            : 'Alarm berbunyi selama Nadi terbuka. Versi native menjadwalkan alarm lewat sistem.'}
        </Banner>
      </div>

      <AlarmPermissionBanner />
      <AlarmBatteryBanner />

      <AlarmTools />

      {alarms === undefined ? (
        <Card className="space-y-3 p-5">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-3 w-1/2" />
        </Card>
      ) : alarms.length === 0 ? (
        <EmptyState
          icon={<AlarmIcon size={24} aria-hidden="true" />}
          title="Belum ada alarm"
          description={
            nativeAlarmsSupported()
              ? 'Buat alarm untuk mengingatkan waktu penting. Alarm berbunyi lewat notifikasi sistem.'
              : 'Buat alarm untuk mengingatkan waktu penting. Nadi akan berbunyi selama aplikasi terbuka.'
          }
          action={<Button onClick={openCreate}>Alarm baru</Button>}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {alarms.map((alarm) => (
              <AlarmListItem
                key={alarm.id}
                alarm={alarm}
                next={alarm.id === nextId}
                onOpen={openEdit}
                onToggle={(item, enabled) => void handleToggle(item, enabled)}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        </Card>
      )}

      {formOpen ? <AlarmFormSheet alarm={editing} onClose={() => setFormOpen(false)} /> : null}

      <DeleteAlarmDialog
        open={Boolean(pendingDelete)}
        label={pendingDelete?.label ?? ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
