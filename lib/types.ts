// Core domain types shared across the engine and UI.

export type Operation = 'multiplication' | 'division' | 'addition' | 'subtraction';
export type Format = 'direct' | 'hole';
export type Difficulty = 1 | 2 | 3;

/** Leitner box index. Higher = better mastered. */
export type Box = 0 | 1 | 2 | 3;
export const BOX_NEW = 0; // nouveau
export const BOX_FRAGILE = 1; // fragile
export const BOX_KNOWN = 2; // connu
export const BOX_MASTERED = 3; // maîtrisé
export const BOX_COUNT = 4;

/** Display order everywhere operations are listed: addition/subtraction on
 * top, multiplication/division below (matches the config screen's 2x2 grid
 * and the progression screen's tab row). */
export const OPERATIONS: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

export const OPERATION_SYMBOL: Record<Operation, string> = {
  multiplication: '×',
  division: '÷',
  addition: '+',
  subtraction: '−',
};

/**
 * A single learnable fact for a profile, carrying its Leitner state.
 * The identity of a fact is (profileId, operation, format, a, b).
 *
 * `a` is always the "table" (the row of the Pythagore grid); `b` the second
 * operand / column. Division and subtraction are stored inverse to their
 * multiplication / addition counterparts (see `lib/format.ts` -> `triple`).
 */
export interface Fact {
  id?: number;
  profileId: number;
  operation: Operation;
  format: Format;
  a: number;
  b: number;
  box: Box;
  /** Consecutive correct answers since last promotion / error. */
  consecutiveCorrect: number;
  timesSeen: number;
  timesCorrect: number;
  /** Epoch ms of last time this fact was answered; 0 if never seen. */
  lastSeen: number;
}

/** The session configuration a profile last used (persisted). */
export interface SessionConfig {
  profileId: number;
  /** At least one. A session pools facts across all selected operations. */
  operations: Operation[];
  /** At least one. */
  formats: Format[];
  difficulty: Difficulty;
  /**
   * When set, only facts whose table (row) is in this set are drilled.
   * Applies to multiplication/division/subtraction; ignored for addition
   * (which has no row/column "table" concept). `null` = all tables.
   */
  targetTables: number[] | null;
  /** Number of questions in a session. */
  questionCount: number;
}

export interface Profile {
  id?: number;
  name: string;
  avatar: string; // emoji
  createdAt: number;
}

export interface EarnedBadge {
  profileId: number;
  badgeId: string;
  earnedAt: number;
}

export interface ActivityDay {
  profileId: number;
  date: string; // YYYY-MM-DD (local)
}

/** A renderable question derived from a Fact + format. */
export interface Question {
  fact: Fact;
  /** Full prompt with the blank shown as "?", e.g. "7 × ? = 56". */
  prompt: string;
  /** The correct numeric answer to the blank. */
  answer: number;
}
