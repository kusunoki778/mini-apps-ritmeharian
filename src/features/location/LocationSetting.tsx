import { MapPin } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toast-store';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { getCurrentCoordinates } from './geolocation';
import type { CityResult } from './geocoding';
import { useCitySearch } from './useCitySearch';
import { useLocationStore } from './location-store';
import { SOURCE_LABEL } from './types';

export function LocationSetting() {
  const location = useLocationStore((state) => state.location);
  const setLocation = useLocationStore((state) => state.setLocation);
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmed = debouncedQuery.trim();
  const cities = useCitySearch(debouncedQuery);

  async function handleUseCurrent() {
    setLocationError(null);
    setLocating(true);

    try {
      const coords = await getCurrentCoordinates();
      setLocation({
        name: 'Lokasi saat ini',
        lat: coords.lat,
        lon: coords.lon,
        source: 'geolocation',
      });
      toast('Lokasi saat ini dipakai.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lokasi gagal dibaca.';
      setLocationError(message);
      toast(message, 'error');
    } finally {
      setLocating(false);
    }
  }

  function handleSelectCity(city: CityResult) {
    setLocation({
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      admin1: city.admin1,
      country: city.country,
      source: 'search',
    });
    setQuery('');
    toast(`Lokasi diatur ke ${city.name}.`, 'success');
  }

  const detail = [location.admin1, location.country].filter(Boolean).join(', ');

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-control bg-paper p-3">
        <MapPin size={20} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{location.name}</p>
          <p className="text-[13px] text-ink-muted">
            {detail ? `${detail} · ` : null}
            {SOURCE_LABEL[location.source]}
          </p>
        </div>
      </div>

      <div>
        <Button variant="secondary" isLoading={locating} onClick={handleUseCurrent}>
          Gunakan lokasi saat ini
        </Button>
        {locationError ? (
          <p role="alert" className="mt-2 text-[13px] text-danger">
            {locationError}
          </p>
        ) : null}
      </div>

      <div>
        <Input
          label="Cari kota"
          placeholder="Contoh: Bandung"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          hint="Minimal dua huruf. Pilih hasil untuk langsung menyimpan lokasi."
          autoComplete="off"
        />

        {trimmed.length < 2 ? null : (
          <div className="mt-3">
            {cities.isFetching && !cities.data ? (
              <div className="space-y-2" aria-hidden="true">
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
              </div>
            ) : null}

            {cities.isError ? (
              <p role="alert" className="text-[13px] text-danger">
                {cities.error instanceof Error
                  ? cities.error.message
                  : 'Pencarian kota gagal. Coba lagi.'}
              </p>
            ) : null}

            {cities.data && cities.data.length === 0 && !cities.isFetching ? (
              <p className="text-[13px] text-ink-muted">Kota tidak ditemukan.</p>
            ) : null}

            {cities.data && cities.data.length > 0 ? (
              <ul
                aria-label="Hasil pencarian kota"
                className="divide-y divide-line overflow-hidden rounded-control border border-line"
              >
                {cities.data.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-paper"
                    >
                      <MapPin size={16} aria-hidden="true" className="shrink-0 text-ink-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{city.name}</span>
                        <span className="block truncate text-[12px] text-ink-muted">
                          {[city.admin1, city.country].filter(Boolean).join(', ')}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
