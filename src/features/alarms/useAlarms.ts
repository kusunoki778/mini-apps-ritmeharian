import { useLiveQuery } from 'dexie-react-hooks';

import type { Alarm } from '@/lib/db/db';
import { listAlarms } from './alarms-repo';

export function useAlarms(): Alarm[] | undefined {
  return useLiveQuery(() => listAlarms(), []);
}
