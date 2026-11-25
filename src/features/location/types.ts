export type LocationSource = 'geolocation' | 'search' | 'default';

export interface Location {
  name: string;
  lat: number;
  lon: number;
  admin1?: string;
  country?: string;
  source: LocationSource;
}

export const DEFAULT_LOCATION: Location = {
  name: 'Jakarta',
  lat: -6.2088,
  lon: 106.8456,
  admin1: 'DKI Jakarta',
  country: 'Indonesia',
  source: 'default',
};

export const SOURCE_LABEL: Record<LocationSource, string> = {
  geolocation: 'Lokasi saat ini',
  search: 'Kota pilihan',
  default: 'Lokasi bawaan',
};
