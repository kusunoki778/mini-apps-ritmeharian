# Nadi

Aplikasi web progresif (PWA) yang menyatukan jam, cuaca, kualitas udara, agenda, catatan, dan alarm dalam satu dasbor.

Status: M8 selesai, pembungkus Capacitor (M10) dengan alarm layar penuh, dan fitur tumbuh kembang (M11) sudah berjalan. Berikutnya M9 rilis dan uji perangkat nyata.

## Hasil audit M8

| Audit             | Hasil                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Lighthouse mobile | Performance 93-94, Accessibility 96, Best Practices 100, CLS 0               |
| Bundle awal       | `index` 123 kB gzip, CSS 8.9 kB gzip, grafis AQI terpisah 117 kB gzip        |
| LCP               | 2.6-2.8 s pada throttle mobile, sedikit di atas target 2.5 s                 |
| Aksesibilitas     | axe bersih dari pelanggaran critical dan serious pada Beranda dan Pengaturan |
| Uji asap Chrome   | 69 dari 69 lulus                                                             |
| Uji lintas mesin  | Firefox dan WebKit lulus alur inti tanpa error konsol                        |

## Dokumen

Baca berurutan:

1. [PRD.md](PRD.md) - masalah, tujuan, lingkup, user story, kebutuhan fungsional.
2. [DESIGN.md](DESIGN.md) - identitas visual, token, layout, komponen, state, aksesibilitas.
3. [ARCHITECTURE.md](ARCHITECTURE.md) - stack, struktur folder, data model, API, PWA, alarm.
4. [TASKS.md](TASKS.md) - milestone, task, kriteria selesai, estimasi.

## Keputusan yang sudah dikunci

| Topik                | Keputusan                                         |
| -------------------- | ------------------------------------------------- |
| Nama                 | Nadi                                              |
| Bahasa UI            | Indonesia                                         |
| Platform             | PWA web, dibungkus Capacitor untuk Android        |
| Stack                | React + TypeScript + Vite + Tailwind CSS          |
| Backend              | Tidak ada                                         |
| Sumber data          | Open-Meteo (cuaca, kualitas udara, geocoding)     |
| Penyimpanan          | IndexedDB lewat Dexie                             |
| Tema                 | Terang dan gelap, mengikuti sistem secara default |
| Target rilis pertama | Enam modul, alarm native lewat Capacitor          |

## Struktur folder yang direncanakan

Kode lama `notes-app` tersimpan di commit git pertama dengan pesan `snapshot: notes-app sebelum migrasi ke Nadi`. Struktur di bawah ini sudah berjalan sejak M0.

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
