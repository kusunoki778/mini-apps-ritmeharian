import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Alarm,
  CalendarBlank,
  GearSix,
  House,
  NotePencil,
  type Icon,
} from '@phosphor-icons/react';

import { Banner } from '@/components/ui/Banner';
import { Toaster } from '@/components/ui/Toaster';
import { useOnline } from '@/lib/hooks/useOnline';
import { cn } from '@/lib/utils/cn';
import { PwaUpdater } from './PwaUpdater';

interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', icon: House, end: true },
  { to: '/kalender', label: 'Kalender', icon: CalendarBlank },
  { to: '/catatan', label: 'Catatan', icon: NotePencil },
  { to: '/alarm', label: 'Alarm', icon: Alarm },
  { to: '/pengaturan', label: 'Pengaturan', icon: GearSix },
];

export function AppShell() {
  const online = useOnline();

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Lewati ke konten
      </a>

      <aside className="hidden border-r border-line bg-surface md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-60 md:flex-col">
        <div className="px-6 py-7">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Nadi<span className="text-accent">.</span>
          </Link>
          <p className="mt-1 text-[13px] text-ink-muted">Ritme harianmu</p>
        </div>

        <nav aria-label="Navigasi utama" className="flex-1 px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent-soft text-ink'
                        : 'text-ink-muted hover:bg-paper hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={20}
                        weight={isActive ? 'fill' : 'regular'}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 py-5 text-[12px] text-ink-muted">v0.1.0, M1</div>
      </aside>

      <div className="md:pl-60">
        <main id="konten" className="mx-auto w-full max-w-5xl px-4 pb-28 pt-8 md:px-8 md:pb-12">
          {!online ? (
            <div className="mb-6">
              <Banner variant="warning">
                Kamu sedang offline. Sebagian data mungkin tertinggal versi lama.
              </Banner>
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                    isActive ? 'text-accent' : 'text-ink-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={22}
                      weight={isActive ? 'fill' : 'regular'}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <PwaUpdater />
      <Toaster />
    </div>
  );
}
