import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db, type Alarm } from '@/lib/db/db';
import AlarmsPage from './AlarmsPage';

async function seed(label: string, extra: Partial<Alarm> = {}) {
  const id = extra.id ?? label.toLowerCase().replace(/\s+/g, '-');

  await db.alarms.add({
    id,
    label,
    hour: 7,
    minute: 30,
    days: [],
    enabled: true,
    snoozeMinutes: 5,
    ...extra,
  });

  return id;
}

async function addAlarm(label: string) {
  await userEvent.click(screen.getAllByRole('button', { name: 'Alarm baru' })[0]);
  await userEvent.type(screen.getByLabelText('Label'), label);
  await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
}

describe('AlarmsPage', () => {
  beforeEach(async () => {
    await db.alarms.clear();
  });

  it('menampilkan state kosong lalu bisa menambah alarm', async () => {
    render(<AlarmsPage />);

    expect(await screen.findByText('Belum ada alarm')).toBeInTheDocument();

    await addAlarm('Bangun');

    expect(await screen.findByText('Bangun')).toBeInTheDocument();
    expect(screen.queryByText('Belum ada alarm')).not.toBeInTheDocument();
  });

  it('menampilkan batas bahwa alarm hanya berjalan saat aplikasi terbuka', async () => {
    render(<AlarmsPage />);
    await screen.findByText('Belum ada alarm');

    expect(screen.getByText(/Alarm berbunyi selama Nadi terbuka/)).toBeInTheDocument();
  });

  it('menyalakan dan mematikan alarm lewat sakelar', async () => {
    await seed('Bangun');
    render(<AlarmsPage />);

    const toggle = await screen.findByRole('switch', { name: 'Nonaktifkan Bangun' });
    await userEvent.click(toggle);

    expect(await screen.findByRole('switch', { name: 'Aktifkan Bangun' })).toBeInTheDocument();
  });

  it('menandai tepat satu alarm berikutnya di antara yang aktif', async () => {
    await seed('Aktif', { enabled: true });
    await seed('Nonaktif', { enabled: false });
    render(<AlarmsPage />);

    await screen.findByText('Aktif');
    expect(screen.getAllByText('Berikutnya')).toHaveLength(1);
  });

  it('tidak menandai apa pun bila semua nonaktif', async () => {
    await seed('Nonaktif', { enabled: false });
    render(<AlarmsPage />);

    await screen.findByText('Nonaktif');
    expect(screen.queryByText('Berikutnya')).not.toBeInTheDocument();
  });

  it('mewajibkan minimal satu hari untuk pengulangan hari tertentu', async () => {
    render(<AlarmsPage />);
    await screen.findByText('Belum ada alarm');

    await userEvent.click(screen.getAllByRole('button', { name: 'Alarm baru' })[0]);
    await userEvent.selectOptions(screen.getByLabelText('Ulangi'), 'Hari tertentu');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Pilih minimal satu hari.')).toBeInTheDocument();
  });

  it('menghapus alarm lewat dialog konfirmasi dengan fokus di Batal', async () => {
    await seed('Bangun');
    render(<AlarmsPage />);

    await screen.findByText('Bangun');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus Bangun' }));

    expect(await screen.findByRole('heading', { name: 'Hapus alarm?' })).toBeInTheDocument();

    const cancel = screen.getByRole('button', { name: 'Batal' });
    await waitFor(() => expect(cancel).toHaveFocus());

    await userEvent.click(cancel);
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Hapus alarm?' })).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Bangun')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hapus Bangun' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus' }));

    expect(await screen.findByText('Belum ada alarm')).toBeInTheDocument();
  });
});
