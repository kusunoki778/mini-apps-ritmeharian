import { create } from 'zustand';

import { readLocation, writeLocation } from './location-storage';
import type { Location } from './types';

interface LocationState {
  location: Location;
  setLocation: (location: Location) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: readLocation(),
  setLocation: (location) => {
    writeLocation(location);
    set({ location });
  },
}));
