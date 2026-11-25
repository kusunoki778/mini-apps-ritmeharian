# Nadi

Aplikasi web progresif (PWA) yang menyatukan jam, cuaca, kualitas udara, agenda, catatan, dan alarm dalam satu dasbor.

Status: tahap perencanaan. Belum ada kode aplikasi. Dokumen di folder ini adalah sumber kebenaran sebelum implementasi.

## Dokumen

Baca berurutan:

1. [PRD.md](PRD.md) - masalah, tujuan, lingkup, user story, kebutuhan fungsional.
2. [DESIGN.md](DESIGN.md) - identitas visual, token, layout, komponen, state, aksesibilitas.
3. [ARCHITECTURE.md](ARCHITECTURE.md) - stack, struktur folder, data model, API, PWA, alarm.
4. [TASKS.md](TASKS.md) - milestone, task, kriteria selesai, estimasi.

## Keputusan yang sudah dikunci

| Topik | Keputusan |
|---|---|
| Nama | Nadi |
| Bahasa UI | Indonesia |
| Platform | PWA web dulu, Capacitor menyusul |
| Stack | React + TypeScript + Vite + Tailwind CSS |
| Backend | Tidak ada |
| Sumber data | Open-Meteo (cuaca, kualitas udara, geocoding) |
| Penyimpanan | IndexedDB lewat Dexie |
| Tema | Terang dan gelap, mengikuti sistem secara default |
| Target rilis pertama | Enam modul, alarm terbatas saat aplikasi terbuka |

## Struktur folder yang direncanakan

Kode lama `notes-app` tetap ada sampai M0 dimulai. Saat M0, isi `src/` diganti bertahap dengan struktur Nadi di bawah ini.

```
notes-app/            <- proyek Nadi
├─ docs/
├─ public/
│  ├─ icons/
│  └─ fonts/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  ├─ lib/
│  ├─ styles/
│  └─ types/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

## Lisensi data

Cuaca dan kualitas udara berasal dari Open-Meteo. Data kualitas udara berisi data CAMS. Atribusi wajib ditampilkan di halaman Pengaturan dan tidak boleh dihapus. Open-Meteo gratis untuk penggunaan non-komersial. Jika proyek ini dipakai secara komersial, lisensi perlu ditinjau ulang.
