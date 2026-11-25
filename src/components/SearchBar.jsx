import React from 'react';

// search bar yang controlled - value dari state parent
function SearchBar({ keyword, onChange }) {
  return (
    <input
      type="text"
      className="search-input"
      placeholder="Cari catatan..."
      value={keyword}
      onChange={onChange}
    />
  );
}

export default SearchBar;
