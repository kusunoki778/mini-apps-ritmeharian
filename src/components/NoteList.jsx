import React from 'react';
import NoteItem from './NoteItem';

// komponen buat nampilin list catatan
function NoteList({ notes, onDelete, onArchive, pesanKosong }) {
  if (notes.length === 0) {
    return <p className="kosong">{pesanKosong}</p>;
  }

  return (
    <div className="notes-container">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          {...note}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}

export default NoteList;
