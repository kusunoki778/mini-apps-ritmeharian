import React, { useState } from 'react';

function NoteForm({ onTambah }) {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');

  const maxJudul = 50;

  const handleJudulChange = (e) => {
    if (e.target.value.length <= maxJudul) {
      setJudul(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (judul.trim() === '' || isi.trim() === '') return;

    onTambah({ judul, isi });

    // reset input setelah submit
    setJudul('');
    setIsi('');
  };

  return (
    <div className="add-note-form">
      <h2>Tambah Catatan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-input-group">
          <input
            type="text"
            placeholder="Judul catatan..."
            value={judul}
            onChange={handleJudulChange}
          />
          <p className={`char-info ${maxJudul - judul.length <= 10 ? 'merah' : ''}`}>
            Sisa karakter: {maxJudul - judul.length}
          </p>
          <textarea
            placeholder="Isi catatan..."
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            rows={4}
          />
          <button
            type="submit"
            className="btn-tambah"
            disabled={!judul.trim() || !isi.trim()}
          >
            Tambah
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;
