import { Capacitor } from '@capacitor/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApkDownload } from './ApkDownload';
import { ApkInstallBanner } from './ApkInstallBanner';

function stubAvailable() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
}

function stubMissing() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ApkDownload', () => {
  it('menampilkan tautan unduh saat berkas tersedia', async () => {
    stubAvailable();
    render(<ApkDownload />);

    const link = await screen.findByRole('link', { name: /Unduh APK/ });
    expect(link).toHaveAttribute('href', '/Nadi.apk');
    expect(link).toHaveAttribute('download', 'Nadi.apk');
  });

  it('memberi tahu saat berkas belum tersedia', async () => {
    stubMissing();
    render(<ApkDownload />);

    expect(await screen.findByText(/belum tersedia/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Unduh APK/ })).not.toBeInTheDocument();
  });
});

describe('ApkInstallBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muncul di peramban dan bisa ditutup permanen', async () => {
    stubAvailable();
    render(<ApkInstallBanner />);

    expect(await screen.findByText(/tersedia sebagai aplikasi Android/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tutup tawaran unduh' }));

    expect(screen.queryByText(/tersedia sebagai aplikasi Android/)).not.toBeInTheDocument();
    expect(localStorage.getItem('nadi.apk-banner-dismissed')).toBe('1');
  });

  it('tidak muncul saat sudah ditolak sebelumnya', async () => {
    stubAvailable();
    localStorage.setItem('nadi.apk-banner-dismissed', '1');
    render(<ApkInstallBanner />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/tersedia sebagai aplikasi Android/)).not.toBeInTheDocument();
  });

  it('tidak muncul di aplikasi native', async () => {
    stubAvailable();
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    render(<ApkInstallBanner />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/tersedia sebagai aplikasi Android/)).not.toBeInTheDocument();
  });
});
