import { beforeEach, describe, expect, it } from 'vitest';

import { readLocation, writeLocation } from './location-storage';
import { DEFAULT_LOCATION, type Location } from './types';

const BANDUNG: Location = {
  name: 'Bandung',
  lat: -6.9175,
  lon: 107.6191,
  admin1: 'Jawa Barat',
  country: 'Indonesia',
  source: 'search',
};

describe('location storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('memakai Jakarta sebagai bawaan saat belum ada data', () => {
    expect(readLocation()).toEqual(DEFAULT_LOCATION);
  });

  it('menyimpan dan membaca lokasi kembali', () => {
    writeLocation(BANDUNG);
    expect(readLocation()).toEqual(BANDUNG);
  });

  it('kembali ke bawaan saat data rusak', () => {
    window.localStorage.setItem('nadi-location', '{bukan json');
    expect(readLocation()).toEqual(DEFAULT_LOCATION);
  });

  it('kembali ke bawaan saat bentuk data salah', () => {
    window.localStorage.setItem('nadi-location', JSON.stringify({ name: 'Tanpa koordinat' }));
    expect(readLocation()).toEqual(DEFAULT_LOCATION);
  });
});
