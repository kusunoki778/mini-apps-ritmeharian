import React, { useState } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import SearchBar from './components/SearchBar';
import { initialNotes, generateId } from './utils/data';

function App() {
  const [catatan, setCatatan] = useState(initialNotes);
  const [keyword, setKeyword] = useState('');

  // pisahin catatan aktif sama yang diarsip
  const catatanAktif = catatan.filter((c) => !c.archived);
  const catatanArsip = catatan.filter((c) => c.archived);

  // filter berdasarkan keyword pencarian
  const filteredAktif = catatanAktif.filter((c) =>
    c.title.toLowerCase().includes(keyword.toLowerCase())
  );
  const filteredArsip = catatanArsip.filter((c) =>
    c.title.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleTambah = ({ judul, isi }) => {
    const baru = {
      id: generateId(),
      title: judul,
      body: isi,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    setCatatan([baru, ...catatan]);
  };

  const handleHapus = (id) => {
    // filter catatan yang bukan id ini
    const hasil = catatan.filter((c) => c.id !== id);
    setCatatan(hasil);
  };

  const handleArsip = (id) => {
    // toggle status archived pake map
    const hasil = catatan.map((c) => {
      if (c.id === id) {
        return { ...c, archived: !c.archived };
      }
      return c;
    });
    setCatatan(hasil);
  };

  return (
    <div>
      <header>
        <h1>Notes App</h1>
        <SearchBar keyword={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </header>

      <div className="main-content">
        <NoteForm onTambah={handleTambah} />

        <h2 className="section-title">Catatan Aktif ({filteredAktif.length})</h2>
        <NoteList
          notes={filteredAktif}
          onDelete={handleHapus}
          onArchive={handleArsip}
          pesanKosong="Tidak ada catatan aktif."
        />

        <h2 className="section-title">Arsip ({filteredArsip.length})</h2>
        <NoteList
          notes={filteredArsip}
          onDelete={handleHapus}
          onArchive={handleArsip}
          pesanKosong="Tidak ada catatan di arsip."
        />
      </div>

      <footer>
        <p>Notes App - Proyek Akhir React</p>
      </footer>
    </div>
  );
}

export default App;
