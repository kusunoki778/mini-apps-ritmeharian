import { describe, expect, it } from 'vitest';

import { mapGeocodingResponse } from './geocoding';

describe('mapGeocodingResponse', () => {
  it('memetakan hasil geocoding ke bentuk kota', () => {
    const result = mapGeocodingResponse({
      results: [
        {
          id: 1642911,
          name: 'Jakarta',
          latitude: -6.21462,
          longitude: 106.84513,
          admin1: 'DKI Jakarta',
          country: 'Indonesia',
        },
      ],
    });

    expect(result).toEqual([
      {
        id: '1642911',
        name: 'Jakarta',
        lat: -6.21462,
        lon: 106.84513,
        admin1: 'DKI Jakarta',
        country: 'Indonesia',
      },
    ]);
  });

  it('mengembalikan array kosong saat tanpa hasil', () => {
    expect(mapGeocodingResponse({})).toEqual([]);
  });

  it('mengembalikan array kosong saat format tidak dikenali', () => {
    expect(mapGeocodingResponse({ results: [{ name: 'Tanpa koordinat' }] })).toEqual([]);
    expect(mapGeocodingResponse(null)).toEqual([]);
  });
});
