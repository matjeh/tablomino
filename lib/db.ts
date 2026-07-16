// Dexie (IndexedDB) schema. Everything is local to the device; no backend.

import Dexie, { Table } from 'dexie';
import {
  ActivityDay,
  EarnedBadge,
  Fact,
  Profile,
  SessionConfig,
} from './types';

export class TablominoDB extends Dexie {
  profiles!: Table<Profile, number>;
  settings!: Table<SessionConfig, number>;
  facts!: Table<Fact, number>;
  badges!: Table<EarnedBadge, [number, string]>;
  activity!: Table<ActivityDay, [number, string]>;

  constructor() {
    super('TablominoDB');
    this.version(1).stores({
      profiles: '++id, name, createdAt',
      // Unique compound identity + indexes for session/badge queries.
      facts:
        '++id, &[profileId+operation+format+a+b], [profileId+operation+format], [profileId+operation]',
      settings: 'profileId',
      badges: '[profileId+badgeId], profileId',
      activity: '[profileId+date], profileId',
    });
  }
}

// Guard against instantiating IndexedDB during SSR / prerender.
let _db: TablominoDB | null = null;

export function getDB(): TablominoDB {
  if (typeof window === 'undefined') {
    throw new Error('TablominoDB is only available in the browser');
  }
  if (!_db) _db = new TablominoDB();
  return _db;
}
