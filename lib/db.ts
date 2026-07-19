// SQLite (native, via @capacitor-community/sqlite) schema + connection.
//
// Everything is local to the device; no backend. Replaces the earlier
// Dexie/IndexedDB implementation -- IndexedDB in WKWebView has no
// persistence guarantee on iOS (evictable under storage pressure with no
// `persist()`-equivalent), whereas native SQLite writes to normal sandboxed
// app storage on both platforms. This plugin has no web implementation, so
// this codebase now only runs inside a Capacitor native shell (Android/iOS),
// not a plain browser -- see project notes for the Bubblewrap/web-deploy
// consequence of that trade.

import { SQLiteConnection, SQLiteDBConnection, CapacitorSQLite } from '@capacitor-community/sqlite';

const DB_NAME = 'tablomino';
const DB_VERSION = 1;

const SCHEMA_V1 = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    profileId INTEGER PRIMARY KEY,
    operations TEXT NOT NULL,
    formats TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    targetTables TEXT,
    questionCount INTEGER NOT NULL
  );`,
  // Identity + index mirror the old Dexie compound index
  // &[profileId+operation+a+b] / [profileId+operation].
  `CREATE TABLE IF NOT EXISTS facts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profileId INTEGER NOT NULL,
    operation TEXT NOT NULL,
    a INTEGER NOT NULL,
    b INTEGER NOT NULL,
    box INTEGER NOT NULL,
    consecutiveCorrect INTEGER NOT NULL,
    timesSeen INTEGER NOT NULL,
    timesCorrect INTEGER NOT NULL,
    lastSeen INTEGER NOT NULL,
    recentResults TEXT NOT NULL,
    UNIQUE (profileId, operation, a, b)
  );`,
  `CREATE INDEX IF NOT EXISTS idx_facts_profile_operation ON facts (profileId, operation);`,
  `CREATE TABLE IF NOT EXISTS badges (
    profileId INTEGER NOT NULL,
    badgeId TEXT NOT NULL,
    earnedAt INTEGER NOT NULL,
    PRIMARY KEY (profileId, badgeId)
  );`,
  `CREATE TABLE IF NOT EXISTS activity (
    profileId INTEGER NOT NULL,
    date TEXT NOT NULL,
    PRIMARY KEY (profileId, date)
  );`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profileId INTEGER NOT NULL,
    playedAt INTEGER NOT NULL,
    operations TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_profile_playedat ON sessions (profileId, playedAt);`,
];

async function openDB(): Promise<SQLiteDBConnection> {
  const sqlite = new SQLiteConnection(CapacitorSQLite);

  await sqlite.addUpgradeStatement(DB_NAME, [
    { toVersion: DB_VERSION, statements: SCHEMA_V1 },
  ]);

  const alreadyOpen = (await sqlite.isConnection(DB_NAME, false)).result;
  const db = alreadyOpen
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);

  await db.open();
  return db;
}

// Guard against instantiating the connection outside a browser/native
// runtime (e.g. during `next build`'s static-generation pass). Memoized as a
// single in-flight/resolved promise so every caller awaits the same open.
let _dbPromise: Promise<SQLiteDBConnection> | null = null;

export function getDB(): Promise<SQLiteDBConnection> {
  if (typeof window === 'undefined') {
    throw new Error('TablominoDB is only available in the browser/native runtime');
  }
  if (!_dbPromise) _dbPromise = openDB();
  return _dbPromise;
}
