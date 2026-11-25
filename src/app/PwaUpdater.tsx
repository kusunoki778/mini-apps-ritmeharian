import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-card border border-line bg-surface p-4 shadow-lg md:bottom-6"
    >
      <p className="text-sm font-medium">Versi baru tersedia.</p>
      <p className="mt-1 text-[13px] text-ink-muted">
        Muat ulang untuk memakai pembaruan. Pekerjaan yang belum disimpan tetap aman.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="min-h-11 rounded-control bg-accent px-4 text-sm font-semibold text-paper"
        >
          Muat ulang
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="min-h-11 rounded-control border border-line px-4 text-sm font-medium text-ink-muted hover:text-ink"
        >
          Nanti
        </button>
      </div>
    </div>
  );
}
