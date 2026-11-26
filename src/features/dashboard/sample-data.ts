// Data contoh untuk modul yang belum aktif. Cuaca dan kualitas udara sudah nyata.

export interface AgendaSample {
  id: string;
  title: string;
  time: string;
  location?: string;
}

export const SAMPLE_AGENDA: AgendaSample[] = [
  { id: 'a1', title: 'Rapat tim produk', time: '09.30', location: 'Ruang Teduh' },
  { id: 'a2', title: 'Review desain Nadi', time: '13.00' },
  { id: 'a3', title: 'Olahraga sore', time: '17.30', location: 'Lapangan' },
];

export interface NotePreviewSample {
  id: string;
  title: string;
  excerpt: string;
  pinned: boolean;
  updatedAt: string;
}

export const SAMPLE_NOTES: NotePreviewSample[] = [
  {
    id: 'n1',
    title: 'Ide dasbor Nadi',
    excerpt: 'Jam jadi fokus utama. Kartu cuaca dan kualitas udara menempel di sebelahnya.',
    pinned: true,
    updatedAt: 'Hari ini',
  },
  {
    id: 'n2',
    title: 'Belanja akhir pekan',
    excerpt: 'Kopi, gula, sabun, dan baterai AA.',
    pinned: false,
    updatedAt: 'Kemarin',
  },
];
