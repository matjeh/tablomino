// Dexie (IndexedDB) schema. Everything is local to the device; no backend.

import Dexie, { Table } from 'dexie';
import {
  ActivityDay,
  EarnedBadge,
  Fact,
  GameSession,
  Profile,
  SessionConfig,
} from './types';

export class TablominoDB extends Dexie {
  profiles!: Table<Profile, number>;
  settings!: Table<SessionConfig, number>;
  facts!: Table<Fact, number>;
  badges!: Table<EarnedBadge, [number, string]>;
  activity!: Table<ActivityDay, [number, string]>;
  sessions!: Table<GameSession, number>;

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
    this.version(2)
      .stores({
        sessions: '++id, [profileId+playedAt]',
      })
      .upgrade(async (tx) => {
        // Pre-existing facts predate the recentResults rolling window used by
        // the connu -> maîtrisé promotion gate; start every fact with an empty
        // window rather than trying to reconstruct history that was never kept.
        //
        // Also merge away the old direct/hole split: a fact's identity used to
        // include `format`, so the same math fact (e.g. 7x8) could have two
        // separate rows with separate progress. Formats now share one row, so
        // collapse any duplicates per (profileId, operation, a, b) first —
        // this must happen *before* version 3 makes that combination unique,
        // otherwise rebuilding that index would fail on the leftover duplicates.
        const table = tx.table('facts');
        const all: (Fact & { format?: string })[] = await table.toArray();
        const groups = new Map<string, (Fact & { format?: string })[]>();
        for (const f of all) {
          const key = `${f.profileId}:${f.operation}:${f.a}:${f.b}`;
          const list = groups.get(key) ?? [];
          list.push(f);
          groups.set(key, list);
        }
        for (const rows of groups.values()) {
          const [keep, ...extra] = rows;
          for (const r of extra) {
            keep.timesSeen += r.timesSeen;
            keep.timesCorrect += r.timesCorrect;
            keep.box = Math.max(keep.box, r.box) as Fact['box'];
            keep.lastSeen = Math.max(keep.lastSeen, r.lastSeen);
          }
          keep.consecutiveCorrect = 0;
          keep.recentResults = [];
          delete keep.format;
          await table.put(keep);
          if (extra.length > 0) await table.bulkDelete(extra.map((r) => r.id));
        }
      });
    // Format is no longer part of a fact's identity (merged in version 2's
    // upgrade) — safe to make the combination unique now that duplicates are gone.
    this.version(3).stores({
      facts: '++id, &[profileId+operation+a+b], [profileId+operation]',
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
