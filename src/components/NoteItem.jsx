import React from 'react';
import { formatDate } from '../utils/data';

function NoteItem({ id, title, body, createdAt, archived, onDelete, onArchive }) {
  return (
    <div className="note-card">
      <h3>{title}</h3>
      <p className="note-date">{formatDate(createdAt)}</p>
      <p className="note-body">{body}</p>
      <div className="note-actions">
        <button className="btn-hapus" onClick={() => onDelete(id)}>
          Hapus
        </button>
        <button
          className={archived ? 'btn-aktif' : 'btn-arsip'}
          onClick={() => onArchive(id)}
        >
          {archived ? 'Aktifkan' : 'Arsipkan'}
        </button>
      </div>
    </div>
  );
}

export default NoteItem;
