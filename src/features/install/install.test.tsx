import { Capacitor } from '@capacitor/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APK_RELEASE_URL } from './apk';
import { ApkDownload } from './ApkDownload';
import { ApkInstallBanner } from './ApkInstallBanner';

function stubLocal() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/vnd.android.package-archive' }),
    }),
  );
}

// Hosting statis membalas halaman aplikasi untuk berkas yang tidak ada.
function stubMissing() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html' }),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ApkDownload', () => {
  it('memakai berkas lokal saat tersedia', async () => {
    stubLocal();
    render(<ApkDownload />);

    const link = await screen.findByRole('link', { name: /Unduh APK/ });
    expect(link).toHaveAttribute('href', '/Nadi.apk');
    expect(link).toHaveAttribute('download', 'Nadi.apk');
  });

  it('jatuh ke aset rilis GitHub saat berkas lokal tidak ada', async () => {
    stubMissing();
    render(<ApkDownload />);

    const link = await screen.findByRole('link', { name: /Unduh APK/ });
    expect(link).toHaveAttribute('href', APK_RELEASE_URL);
  });
});

describe('ApkInstallBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muncul di peramban dan bisa ditutup permanen', async () => {
    stubLocal();
    render(<ApkInstallBanner />);

    expect(await screen.findByText(/tersedia sebagai aplikasi Android/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tutup tawaran unduh' }));

    expect(screen.queryByText(/tersedia sebagai aplikasi Android/)).not.toBeInTheDocument();
    expect(localStorage.getItem('nadi.apk-banner-dismissed')).toBe('1');
  });

  it('tidak muncul saat sudah ditolak sebelumnya', async () => {
    stubLocal();
    localStorage.setItem('nadi.apk-banner-dismissed', '1');
    render(<ApkInstallBanner />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/tersedia sebagai aplikasi Android/)).not.toBeInTheDocument();
  });

  it('tidak muncul di aplikasi native', async () => {
    stubLocal();
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    render(<ApkInstallBanner />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/tersedia sebagai aplikasi Android/)).not.toBeInTheDocument();
  });
});
