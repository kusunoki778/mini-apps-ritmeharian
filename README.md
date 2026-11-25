# 📒 NoteApp — Aplikasi Catatan React

Aplikasi catatan modern berbasis React yang memenuhi semua checklist submission Dicoding.

## ✅ Checklist yang Terpenuhi

| Kriteria | Implementasi |
|---|---|
| **Penguasaan Array Function** | `.filter()`, `.map()` di `App.jsx` dan `NoteList.jsx` |
| **Reusable Component** | `NoteItem`, `NoteList`, `SearchBar`, `NoteForm` |
| **State & Event Management** | `useState` di `App.jsx` & `NoteForm.jsx`, event handlers |
| **Controlled Form** | `NoteForm.jsx` — semua input dikontrol state React |

## 🗂️ Struktur Proyek

```
notes-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx              ← Logika utama + Array Functions
    ├── index.css            ← Global styling (dark mode)
    ├── utils/
    │   └── data.js          ← Data awal + helper functions
    └── components/
        ├── NoteForm.jsx     ← Controlled Form ✅
        ├── NoteItem.jsx     ← Reusable Component ✅
        ├── NoteList.jsx     ← Reusable Component + .map() ✅
        └── SearchBar.jsx    ← Controlled Component ✅
```

## 🚀 Cara Menjalankan

### 1. Install Node.js (jika belum)
Download dari: https://nodejs.org (versi LTS)

### 2. Install dependencies
```bash
cd notes-app
npm install
```

### 3. Jalankan development server
```bash
npm run dev
```

Buka browser di: `http://localhost:5173`

## 🔧 Fitur Aplikasi

- ➕ **Tambah catatan** baru dengan judul (maks 50 karakter) dan isi
- 🔍 **Cari catatan** berdasarkan judul (real-time)
- 📦 **Arsipkan / Aktifkan** catatan
- 🗑️ **Hapus** catatan
- 📊 **Statistik** jumlah catatan aktif dan arsip
- 📋 **Tab navigasi** antara catatan aktif dan arsip
