// High-level data-access helpers built on Dexie. The UI and contexts talk to
// these rather than to Dexie directly.

import { getDB } from './db';
import { FactKey, universeKeys } from './facts';
import { todayStr } from './badges';
import {
  Difficulty,
  EarnedBadge,
  Fact,
  GameSession,
  Operation,
  Profile,
  SessionConfig,
} from './types';

// ---- Profiles -------------------------------------------------------------

export async function listProfiles(): Promise<Profile[]> {
  return getDB().profiles.orderBy('createdAt').toArray();
}

export async function createProfile(name: string, avatar: string): Promise<number> {
  return getDB().profiles.add({ name, avatar, createdAt: Date.now() });
}

export async function getProfile(id: number): Promise<Profile | undefined> {
  return getDB().profiles.get(id);
}

export async function updateProfileAvatar(id: number, avatar: string): Promise<void> {
  await getDB().profiles.update(id, { avatar });
}

/** Lifetime total correct answers across every fact the profile has touched. */
export async function getTotalCorrect(profileId: number): Promise<number> {
  const rows = await getDB().facts.where('profileId').equals(profileId).toArray();
  return rows.reduce((sum, f) => sum + f.timesCorrect, 0);
}

export async function deleteProfile(id: number): Promise<void> {
  const db = getDB();
  await db.transaction(
    'rw',
    db.profiles,
    db.settings,
    db.facts,
    db.badges,
    db.activity,
    async () => {
      await db.profiles.delete(id);
      await db.settings.delete(id);
      await db.facts.where('profileId').equals(id).delete();
      await db.badges.where('profileId').equals(id).delete();
      await db.activity.where('profileId').equals(id).delete();
    },
  );
}

// ---- Settings -------------------------------------------------------------

const DEFAULT_CONFIG = (profileId: number): SessionConfig => ({
  profileId,
  operations: ['multiplication'],
  formats: ['direct'],
  difficulty: 1,
  targetTables: null,
  questionCount: 10,
});

/** Guards against pre-multi-select rows (singular operation/format, no questionCount). */
function isCurrentShape(config: unknown): config is SessionConfig {
  const c = config as Partial<SessionConfig> | undefined;
  return (
    !!c &&
    Array.isArray(c.operations) &&
    Array.isArray(c.formats) &&
    typeof c.questionCount === 'number'
  );
}

export async function getSettings(profileId: number): Promise<SessionConfig> {
  const found = await getDB().settings.get(profileId);
  return isCurrentShape(found) ? found : DEFAULT_CONFIG(profileId);
}

export async function saveSettings(config: SessionConfig): Promise<void> {
  await getDB().settings.put(config);
}

// ---- Facts ----------------------------------------------------------------

function syntheticFact(profileId: number, operation: Operation, a: number, b: number): Fact {
  return {
    profileId,
    operation,
    a,
    b,
    box: 0,
    consecutiveCorrect: 0,
    timesSeen: 0,
    timesCorrect: 0,
    lastSeen: 0,
    recentResults: [],
  };
}

function mergeUniverse(
  profileId: number,
  operation: Operation,
  keys: FactKey[],
  stored: Fact[],
): Fact[] {
  const byKey = new Map<string, Fact>();
  for (const f of stored) byKey.set(`${f.a}:${f.b}`, f);
  return keys.map(
    (k) => byKey.get(`${k.a}:${k.b}`) ?? syntheticFact(profileId, operation, k.a, k.b),
  );
}

async function loadStored(profileId: number, operation: Operation): Promise<Fact[]> {
  return getDB()
    .facts.where('[profileId+operation]')
    .equals([profileId, operation])
    .toArray();
}

/** Full universe (stored + synthetic) filtered to `targetTables` if set. */
export async function loadSessionUniverse(
  profileId: number,
  operation: Operation,
  difficulty: Difficulty,
  targetTables: number[] | null,
): Promise<Fact[]> {
  const stored = await loadStored(profileId, operation);
  return mergeUniverse(
    profileId,
    operation,
    universeKeys(operation, difficulty, targetTables),
    stored,
  );
}

/** Full universe across all tables (for badge / grid-mastery evaluation). */
export async function loadFullUniverse(
  profileId: number,
  operation: Operation,
  difficulty: Difficulty,
): Promise<Fact[]> {
  const stored = await loadStored(profileId, operation);
  return mergeUniverse(
    profileId,
    operation,
    universeKeys(operation, difficulty, null),
    stored,
  );
}

/** Persist the facts touched during a session (insert or update). */
export async function saveFacts(facts: Fact[]): Promise<void> {
  if (facts.length === 0) return;
  await getDB().facts.bulkPut(facts);
}

// ---- Activity & badges ----------------------------------------------------

export async function recordActivityToday(profileId: number): Promise<void> {
  await getDB().activity.put({ profileId, date: todayStr() });
}

export async function getActivityDates(profileId: number): Promise<string[]> {
  const rows = await getDB().activity.where('profileId').equals(profileId).toArray();
  return rows.map((r) => r.date);
}

export async function getEarnedBadgeIds(profileId: number): Promise<string[]> {
  const rows = await getDB().badges.where('profileId').equals(profileId).toArray();
  return rows.map((r) => r.badgeId);
}

export async function awardBadges(profileId: number, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const now = Date.now();
  const rows: EarnedBadge[] = ids.map((badgeId) => ({
    profileId,
    badgeId,
    earnedAt: now,
  }));
  await getDB().badges.bulkPut(rows);
}

// ---- Session history (progression-page chart) ------------------------------

export async function recordGameSession(
  session: Omit<GameSession, 'id'>,
): Promise<void> {
  await getDB().sessions.add(session);
}

/** Most recent `limit` sessions for a profile, newest first. */
export async function getRecentSessions(
  profileId: number,
  limit = 20,
): Promise<GameSession[]> {
  return getDB()
    .sessions.where('[profileId+playedAt]')
    .between([profileId, 0], [profileId, Infinity])
    .reverse()
    .limit(limit)
    .toArray();
}
