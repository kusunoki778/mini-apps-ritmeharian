import { useLiveQuery } from 'dexie-react-hooks';

import type { Note } from '@/lib/db/db';
import { getRecentNotes, searchNotes } from './notes-repo';

export function useNotes(query: string): Note[] | undefined {
  return useLiveQuery(() => searchNotes(query), [query]);
}

export function useRecentNotes(limit = 2): Note[] | undefined {
  return useLiveQuery(() => getRecentNotes(limit), [limit]);
}
