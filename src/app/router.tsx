import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { AppShell } from './AppShell';

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage'));
const NotesPage = lazy(() => import('@/features/notes/NotesPage'));
const AlarmsPage = lazy(() => import('@/features/alarms/AlarmsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('@/features/not-found/NotFoundPage'));

function RouteFallback() {
  return (
    <div aria-busy="true" aria-label="Memuat halaman" className="space-y-4">
      <div className="h-8 w-40 rounded bg-line" />
      <div className="h-52 rounded-card border border-line bg-surface" />
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

function RouteError() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="text-[13px] font-medium text-ink-muted">Terjadi kesalahan</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Halaman gagal dimuat</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Coba muat ulang halaman. Kalau masalah berlanjut, kembali ke Beranda.
      </p>
      {status ? <p className="mt-2 text-[13px] text-ink-muted">Kode: {status}</p> : null}
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-semibold text-paper"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'kalender', element: withSuspense(<CalendarPage />) },
      { path: 'catatan', element: withSuspense(<NotesPage />) },
      { path: 'alarm', element: withSuspense(<AlarmsPage />) },
      { path: 'pengaturan', element: withSuspense(<SettingsPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
