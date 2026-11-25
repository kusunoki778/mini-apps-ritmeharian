/**
 * data.js
 * Berisi data awal (initialNotes) dan helper functions
 * yang digunakan di seluruh aplikasi Notes App.
 */

/**
 * initialNotes — array data catatan awal saat aplikasi pertama dibuka.
 * Setiap catatan memiliki properti:
 *   - id        : identifikasi unik (number)
 *   - title     : judul catatan (string)
 *   - body      : isi catatan (string)
 *   - archived  : status arsip, true = diarsipkan (boolean)
 *   - createdAt : waktu pembuatan dalam format ISO string
 */
export const initialNotes = [
  {
    id: 1,
    title: 'Belajar React',
    body: 'React itu library JavaScript buat bikin UI. Konsep utamanya adalah component, state sama props.',
    archived: false,
    createdAt: '2025-04-05T04:14:49.677Z',
  },
  {
    id: 2,
    title: 'Array Function di JavaScript',
    body: 'Yang sering dipake: map() buat transformasi array, filter() buat nyaring data, find() buat cari satu item.',
    archived: false,
    createdAt: '2025-04-06T04:14:49.677Z',
  },
  {
    id: 3,
    title: 'Perbedaan State dan Props',
    body: 'State itu data yang bisa berubah di dalam komponen sendiri. Props itu data yang dikirim dari komponen parent ke child, sifatnya read-only.',
    archived: false,
    createdAt: '2025-04-07T04:14:49.677Z',
  },
  {
    id: 4,
    title: 'Catatan Meeting',
    body: 'Bahas progress tugas akhir, deadline minggu depan, perlu selesaikan bagian routing.',
    archived: true,
    createdAt: '2025-04-08T04:14:49.677Z',
  },
  {
    id: 5,
    title: 'Ide Proyek',
    body: 'Bikin aplikasi catatan pake React. Fitur: tambah, hapus, arsip, cari catatan.',
    archived: true,
    createdAt: '2025-04-09T04:14:49.677Z',
  },
];

/**
 * generateId — membuat ID unik berdasarkan timestamp saat ini.
 * Menggunakan unary + untuk mengkonversi Date ke number (milliseconds).
 *
 * @returns {number} ID unik berupa angka timestamp
 */
export const generateId = () => +new Date();

/**
 * formatDate — mengubah string ISO date menjadi format tanggal Indonesia.
 * Contoh output: "5 April 2025"
 *
 * @param {string} dateString - tanggal dalam format ISO string
 * @returns {string} tanggal dalam format lokal Indonesia
 */
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

/**
 * filterByKeyword — menyaring array catatan berdasarkan kata kunci pada judul.
 * Pencarian bersifat case-insensitive (tidak membedakan huruf besar/kecil).
 *
 * @param {Array}  notes   - array catatan yang akan difilter
 * @param {string} keyword - kata kunci pencarian
 * @returns {Array} array catatan yang judulnya mengandung keyword
 */
export const filterByKeyword = (notes, keyword) =>
  notes.filter((note) => note.title.toLowerCase().includes(keyword.toLowerCase()));
