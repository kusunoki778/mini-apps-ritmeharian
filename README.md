# Nadi

Aplikasi web progresif untuk jam, cuaca, kualitas udara, agenda, catatan, dan alarm dalam satu dasbor.

Status: M8, pengaturan lengkap, ekspor dan impor JSON, serta hapus data sudah ada. Audit offline, aksesibilitas, dan performa menyusul.

## Menjalankan

```
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Skrip

| Skrip                | Fungsi                       |
| -------------------- | ---------------------------- |
| `npm run dev`        | Server pengembangan          |
| `npm run build`      | Cek tipe lalu build produksi |
| `npm run preview`    | Pratinjau hasil build        |
| `npm test`           | Unit test sekali jalan       |
| `npm run test:watch` | Unit test mode pantau        |
| `npm run lint`       | ESLint                       |
| `npm run typecheck`  | Cek TypeScript               |

## Dokumen

- [docs/README.md](docs/README.md) - ringkasan dan keputusan proyek
- [docs/PRD.md](docs/PRD.md) - produk dan lingkup
- [docs/DESIGN.md](docs/DESIGN.md) - arah visual dan sistem desain
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - arsitektur teknis
- [docs/TASKS.md](docs/TASKS.md) - milestone dan task

## Catatan migrasi

Kode notes-app versi lama tersimpan di commit git pertama dengan pesan `snapshot: notes-app sebelum migrasi ke Nadi`. Ikon di `public/icons` masih placeholder sampai identitas final disetujui.

## Lisensi data

Cuaca dan kualitas udara berasal dari Open-Meteo, dengan data CAMS untuk kualitas udara. Penggunaan non-komersial.
