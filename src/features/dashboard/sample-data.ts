// Data contoh untuk modul yang belum aktif. Cuaca, kualitas udara, dan catatan sudah nyata.

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
