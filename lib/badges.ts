// Badge definitions + evaluation. Pure: given a snapshot of what just
// happened + the profile's fact state, return the set of newly-earned badges.
//
// Badge ids are either static ("first-session") or parameterised
// ("table:multiplication:7", "grid-complete:multiplication").

import { progressionTables } from './facts';
import { BOX_MASTERED, Difficulty, Fact, Operation } from './types';

export interface BadgeDisplay {
  id: string;
  emoji: string;
  /** i18n key for the title. Table badges also pass params. */
  titleKey: string;
  descKey: string;
  params?: Record<string, string | number>;
}

interface StaticBadge {
  id: string;
  emoji: string;
  titleKey: string;
  descKey: string;
}

const STATIC_BADGES: StaticBadge[] = [
  {
    id: 'first-session',
    emoji: '🎉',
    titleKey: 'badge.firstSession.title',
    descKey: 'badge.firstSession.desc',
  },
  {
    id: 'perfect-session',
    emoji: '⭐',
    titleKey: 'badge.perfect.title',
    descKey: 'badge.perfect.desc',
  },
  {
    id: 'streak-3',
    emoji: '🔥',
    titleKey: 'badge.streak.title',
    descKey: 'badge.streak.desc',
  },
  {
    id: 'first-division',
    emoji: '➗',
    titleKey: 'badge.firstDivision.title',
    descKey: 'badge.firstDivision.desc',
  },
];

const STATIC_BY_ID = new Map(STATIC_BADGES.map((b) => [b.id, b]));

/** Lifetime correct-answer thresholds, shown identically on every operation's
 * gallery (same treatment as the static badges — not operation-scoped). */
export const CORRECT_MILESTONES = [100, 500, 1000, 2000, 5000, 10000];

/** Context describing a just-finished session + current state. */
export interface BadgeContext {
  operation: Operation;
  difficulty: Difficulty;
  /** Correct answers this session and total questions. */
  score: number;
  total: number;
  /** Sessions completed by the profile, including the one just finished. */
  sessionsCompleted: number;
  /** At least one division answered correctly (this session or before). */
  hadDivisionSuccess: boolean;
  /**
   * Full fact universe for (profile, operation) at the current difficulty,
   * with unseen facts present as box 0. Used for table / grid mastery.
   */
  facts: Fact[];
  /** Distinct YYYY-MM-DD active days (local), including today. */
  activityDates: string[];
  /** Lifetime correct answers across every operation, after this session's
   * results are saved. */
  totalCorrect: number;
  /** Already-earned badge ids. */
  earned: Set<string>;
}

/** Groups by the exact row, except addition, which groups by the addend's
 * last digit (see `progressionTables` in lib/facts.ts). */
function tableKeyOf(operation: Operation, fact: Fact): number {
  return operation === 'addition' ? fact.a % 10 : fact.a;
}

function tablesMastered(operation: Operation, facts: Fact[]): Set<number> {
  const byTable = new Map<number, Fact[]>();
  for (const f of facts) {
    const key = tableKeyOf(operation, f);
    const list = byTable.get(key) ?? [];
    list.push(f);
    byTable.set(key, list);
  }
  const mastered = new Set<number>();
  for (const [table, list] of byTable) {
    if (list.length > 0 && list.every((f) => f.box === BOX_MASTERED)) {
      mastered.add(table);
    }
  }
  return mastered;
}

/** Tolerant 3-day streak: 3+ active days within the trailing 5-day window. */
function hasStreak3(activityDates: string[], today = todayStr()): boolean {
  const window = new Set<string>();
  const base = new Date(today + 'T00:00:00');
  for (let i = 0; i < 5; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    window.add(isoDate(d));
  }
  const active = new Set(activityDates.filter((d) => window.has(d)));
  return active.size >= 3;
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return isoDate(new Date());
}

/**
 * Current consecutive-day practice streak, counted back from today (or
 * yesterday if today hasn't been played yet, so the streak doesn't drop to 0
 * at midnight before the child has had a chance to play).
 */
export function currentStreak(activityDates: string[], today = todayStr()): number {
  const set = new Set(activityDates);
  const anchor = new Date(today + 'T00:00:00');
  if (!set.has(isoDate(anchor))) anchor.setDate(anchor.getDate() - 1);

  let streak = 0;
  const cursor = new Date(anchor);
  while (set.has(isoDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Return badge ids newly earned by this context (excluding already-earned). */
export function evaluateBadges(ctx: BadgeContext): string[] {
  const earned: string[] = [];
  const add = (id: string) => {
    if (!ctx.earned.has(id) && !earned.includes(id)) earned.push(id);
  };

  if (ctx.sessionsCompleted >= 1) add('first-session');
  if (ctx.total > 0 && ctx.score === ctx.total) add('perfect-session');
  if (hasStreak3(ctx.activityDates)) add('streak-3');
  if (ctx.hadDivisionSuccess) add('first-division');
  for (const milestone of CORRECT_MILESTONES) {
    if (ctx.totalCorrect >= milestone) add(`correct:${milestone}`);
  }

  const mastered = tablesMastered(ctx.operation, ctx.facts);
  for (const table of mastered) add(`table:${ctx.operation}:${table}`);

  // Grid complete = every fact in the operation universe mastered.
  if (ctx.facts.length > 0 && ctx.facts.every((f) => f.box === BOX_MASTERED)) {
    add(`grid-complete:${ctx.operation}`);
  }

  return earned;
}

/** Resolve any badge id (static or parameterised) into display info. */
export function badgeInfo(id: string): BadgeDisplay {
  const stat = STATIC_BY_ID.get(id);
  if (stat) return { ...stat };

  const [kind, operation, tableStr] = id.split(':');
  if (kind === 'table') {
    return {
      id,
      emoji: '🏅',
      titleKey: 'badge.table.title',
      descKey: 'badge.table.desc',
      params: { table: Number(tableStr) },
    };
  }
  if (kind === 'grid-complete') {
    return {
      id,
      emoji: '🏆',
      titleKey: 'badge.grid.title',
      descKey: 'badge.grid.desc',
      params: { operation: operation ?? '' },
    };
  }
  if (kind === 'correct') {
    return {
      id,
      emoji: '💯',
      titleKey: 'badge.correctMilestone.title',
      descKey: 'badge.correctMilestone.desc',
      params: { count: Number(operation) },
    };
  }
  return { id, emoji: '🎖️', titleKey: 'badge.unknown.title', descKey: 'badge.unknown.desc' };
}

/** Every badge attainable for an operation + difficulty (for the gallery). */
export function allBadgeIds(operation: Operation, difficulty: Difficulty): string[] {
  const ids = STATIC_BADGES.map((b) => b.id);
  for (const milestone of CORRECT_MILESTONES) ids.push(`correct:${milestone}`);
  for (const table of progressionTables(operation, difficulty)) {
    ids.push(`table:${operation}:${table}`);
  }
  ids.push(`grid-complete:${operation}`);
  return ids;
}
