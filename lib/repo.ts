// High-level data-access helpers built on the native SQLite connection. The
// UI and contexts talk to these rather than to `lib/db.ts` directly. Every
// exported function here keeps the same name/signature it had under the old
// Dexie/IndexedDB implementation -- nothing above this file needed to
// change for the SQLite migration.

import { DBSQLiteValues } from '@capacitor-community/sqlite';
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

function rows<T>(res: DBSQLiteValues): T[] {
  return (res.values ?? []) as T[];
}

// ---- Row <-> domain-type mapping (JSON-encoded array columns) -------------

interface FactRow {
  id: number;
  profileId: number;
  operation: Operation;
  a: number;
  b: number;
  box: Fact['box'];
  consecutiveCorrect: number;
  timesSeen: number;
  timesCorrect: number;
  lastSeen: number;
  recentResults: string;
}

function factFromRow(r: FactRow): Fact {
  return { ...r, recentResults: JSON.parse(r.recentResults) };
}

interface SettingsRow {
  profileId: number;
  operations: string;
  formats: string;
  difficulty: Difficulty;
  targetTables: string | null;
  questionCount: number;
}

function settingsFromRow(r: SettingsRow): SessionConfig {
  return {
    profileId: r.profileId,
    operations: JSON.parse(r.operations),
    formats: JSON.parse(r.formats),
    difficulty: r.difficulty,
    targetTables: r.targetTables ? JSON.parse(r.targetTables) : null,
    questionCount: r.questionCount,
  };
}

interface SessionRow {
  id: number;
  profileId: number;
  playedAt: number;
  operations: string;
  score: number;
  total: number;
}

function sessionFromRow(r: SessionRow): GameSession {
  return { ...r, operations: JSON.parse(r.operations) };
}

// ---- Profiles -------------------------------------------------------------

export async function listProfiles(): Promise<Profile[]> {
  const db = await getDB();
  const res = await db.query('SELECT * FROM profiles ORDER BY createdAt ASC');
  return rows<Profile>(res);
}

export async function createProfile(name: string, avatar: string): Promise<number> {
  const db = await getDB();
  const res = await db.run('INSERT INTO profiles (name, avatar, createdAt) VALUES (?, ?, ?)', [
    name,
    avatar,
    Date.now(),
  ]);
  return res.changes!.lastId!;
}

export async function getProfile(id: number): Promise<Profile | undefined> {
  const db = await getDB();
  const res = await db.query('SELECT * FROM profiles WHERE id = ?', [id]);
  return rows<Profile>(res)[0];
}

export async function updateProfileAvatar(id: number, avatar: string): Promise<void> {
  const db = await getDB();
  await db.run('UPDATE profiles SET avatar = ? WHERE id = ?', [avatar, id]);
}

/** Lifetime total correct answers across every fact the profile has touched. */
export async function getTotalCorrect(profileId: number): Promise<number> {
  const db = await getDB();
  const res = await db.query(
    'SELECT COALESCE(SUM(timesCorrect), 0) AS total FROM facts WHERE profileId = ?',
    [profileId],
  );
  return rows<{ total: number }>(res)[0]?.total ?? 0;
}

export async function deleteProfile(id: number): Promise<void> {
  const db = await getDB();
  await db.executeSet(
    [
      { statement: 'DELETE FROM profiles WHERE id = ?', values: [id] },
      { statement: 'DELETE FROM settings WHERE profileId = ?', values: [id] },
      { statement: 'DELETE FROM facts WHERE profileId = ?', values: [id] },
      { statement: 'DELETE FROM badges WHERE profileId = ?', values: [id] },
      { statement: 'DELETE FROM activity WHERE profileId = ?', values: [id] },
      { statement: 'DELETE FROM sessions WHERE profileId = ?', values: [id] },
    ],
    true,
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

export async function getSettings(profileId: number): Promise<SessionConfig> {
  const db = await getDB();
  const res = await db.query('SELECT * FROM settings WHERE profileId = ?', [profileId]);
  const row = rows<SettingsRow>(res)[0];
  return row ? settingsFromRow(row) : DEFAULT_CONFIG(profileId);
}

export async function saveSettings(config: SessionConfig): Promise<void> {
  const db = await getDB();
  await db.run(
    `INSERT INTO settings (profileId, operations, formats, difficulty, targetTables, questionCount)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(profileId) DO UPDATE SET
       operations = excluded.operations,
       formats = excluded.formats,
       difficulty = excluded.difficulty,
       targetTables = excluded.targetTables,
       questionCount = excluded.questionCount`,
    [
      config.profileId,
      JSON.stringify(config.operations),
      JSON.stringify(config.formats),
      config.difficulty,
      config.targetTables ? JSON.stringify(config.targetTables) : null,
      config.questionCount,
    ],
  );
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
  const db = await getDB();
  const res = await db.query('SELECT * FROM facts WHERE profileId = ? AND operation = ?', [
    profileId,
    operation,
  ]);
  return rows<FactRow>(res).map(factFromRow);
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
  const db = await getDB();
  await db.executeSet(
    facts.map((f) => ({
      statement: `INSERT INTO facts (profileId, operation, a, b, box, consecutiveCorrect, timesSeen, timesCorrect, lastSeen, recentResults)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(profileId, operation, a, b) DO UPDATE SET
          box = excluded.box,
          consecutiveCorrect = excluded.consecutiveCorrect,
          timesSeen = excluded.timesSeen,
          timesCorrect = excluded.timesCorrect,
          lastSeen = excluded.lastSeen,
          recentResults = excluded.recentResults`,
      values: [
        f.profileId,
        f.operation,
        f.a,
        f.b,
        f.box,
        f.consecutiveCorrect,
        f.timesSeen,
        f.timesCorrect,
        f.lastSeen,
        JSON.stringify(f.recentResults),
      ],
    })),
    true,
  );
}

// ---- Activity & badges ----------------------------------------------------

export async function recordActivityToday(profileId: number): Promise<void> {
  const db = await getDB();
  await db.run(
    'INSERT INTO activity (profileId, date) VALUES (?, ?) ON CONFLICT(profileId, date) DO NOTHING',
    [profileId, todayStr()],
  );
}

export async function getActivityDates(profileId: number): Promise<string[]> {
  const db = await getDB();
  const res = await db.query('SELECT date FROM activity WHERE profileId = ?', [profileId]);
  return rows<{ date: string }>(res).map((r) => r.date);
}

export async function getEarnedBadgeIds(profileId: number): Promise<string[]> {
  const db = await getDB();
  const res = await db.query('SELECT badgeId FROM badges WHERE profileId = ?', [profileId]);
  return rows<{ badgeId: string }>(res).map((r) => r.badgeId);
}

export async function awardBadges(profileId: number, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDB();
  const now = Date.now();
  const rowsToInsert: EarnedBadge[] = ids.map((badgeId) => ({ profileId, badgeId, earnedAt: now }));
  await db.executeSet(
    rowsToInsert.map((r) => ({
      statement:
        'INSERT INTO badges (profileId, badgeId, earnedAt) VALUES (?, ?, ?) ON CONFLICT(profileId, badgeId) DO NOTHING',
      values: [r.profileId, r.badgeId, r.earnedAt],
    })),
    true,
  );
}

// ---- Session history (progression-page chart) ------------------------------

export async function recordGameSession(session: Omit<GameSession, 'id'>): Promise<void> {
  const db = await getDB();
  await db.run(
    'INSERT INTO sessions (profileId, playedAt, operations, score, total) VALUES (?, ?, ?, ?, ?)',
    [session.profileId, session.playedAt, JSON.stringify(session.operations), session.score, session.total],
  );
}

/** Most recent `limit` sessions for a profile, newest first. */
export async function getRecentSessions(
  profileId: number,
  limit = 20,
): Promise<GameSession[]> {
  const db = await getDB();
  const res = await db.query(
    'SELECT * FROM sessions WHERE profileId = ? ORDER BY playedAt DESC LIMIT ?',
    [profileId, limit],
  );
  return rows<SessionRow>(res).map(sessionFromRow);
}
