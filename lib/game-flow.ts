// Glue between the pure engine and the data layer: build a fresh set of
// questions for a session, and persist + score a finished one.

import { evaluateBadges } from './badges';
import { shuffle } from './distractors';
import { buildQuestion } from './format';
import { pickSessionFacts } from './session';
import {
  awardBadges,
  getActivityDates,
  getEarnedBadgeIds,
  getTotalCorrect,
  loadFullUniverse,
  loadSessionUniverse,
  recordActivityToday,
  recordGameSession,
  saveFacts,
} from './repo';
import { SessionResult } from './active-session';
import { Fact, Operation, Question, SessionConfig } from './types';

/** Split `total` as evenly as possible across `n` buckets (remainder to the first ones). */
function splitEvenly(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const counts = Array(n).fill(base);
  for (let i = 0; i < total - base * n; i++) counts[i]++;
  return counts;
}

/**
 * Build the session's questions. Operations have wildly different fact-universe
 * sizes (e.g. multiplication ≈ 110 facts vs. addition ≈ 4,950 at difficulty 3),
 * and `pickSessionFacts`'s weighting balances by Leitner box, not by operation —
 * pooling everything into one flat list before picking would let a much bigger
 * universe crowd out a smaller one almost entirely by sheer candidate count. So
 * each selected operation gets an even, guaranteed slice of `questionCount`
 * first; only within that slice does the usual weak-facts-first weighting apply.
 */
async function loadOperationPool(
  config: Pick<SessionConfig, 'profileId' | 'difficulty' | 'targetTables'>,
  operation: Operation,
): Promise<Fact[]> {
  const tables = operation === 'addition' ? null : config.targetTables;
  return loadSessionUniverse(config.profileId, operation, config.difficulty, tables);
}

/**
 * Pick `count` facts from `pool`, repeating from the top (reshuffled) once
 * the pool is exhausted — a small fact universe (e.g. multiplication at the
 * easiest difficulty has only 40) shouldn't cap how long a session can be.
 */
function pickWithRepeats(pool: Fact[], count: number): Fact[] {
  const picked: Fact[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(...pickSessionFacts(pool, { count: count - picked.length }));
  }
  return picked;
}

export async function buildSessionQuestions(
  config: SessionConfig,
): Promise<Question[]> {
  const perOpCount = splitEvenly(config.questionCount, config.operations.length);
  const picked: Fact[] = [];

  for (const [i, operation] of config.operations.entries()) {
    const pool = await loadOperationPool(config, operation);
    picked.push(...pickWithRepeats(pool, perOpCount[i]));
  }

  return shuffle(picked).map((f) =>
    buildQuestion(f, config.formats[Math.floor(Math.random() * config.formats.length)]),
  );
}

/**
 * Persist a finished session, record today's activity, evaluate badges, and
 * return the result for the bilan screen.
 */
export async function finalizeSession(
  config: SessionConfig,
  updatedFacts: Fact[],
  correctCount: number,
  total: number,
  divisionSuccess: boolean,
): Promise<SessionResult> {
  await saveFacts(updatedFacts);
  await recordActivityToday(config.profileId);
  await recordGameSession({
    profileId: config.profileId,
    playedAt: Date.now(),
    operations: config.operations,
    score: correctCount,
    total,
  });

  const earned = new Set(await getEarnedBadgeIds(config.profileId));
  const activityDates = await getActivityDates(config.profileId);
  // Facts are already saved above, so this reflects this session's results too.
  const totalCorrect = await getTotalCorrect(config.profileId);
  const allNewBadges = new Set<string>();

  // Evaluate badges once per operation actually played this session.
  for (const operation of config.operations) {
    const fullUniverse = await loadFullUniverse(
      config.profileId,
      operation,
      config.difficulty,
    );
    const newBadges = evaluateBadges({
      operation,
      difficulty: config.difficulty,
      score: correctCount,
      total,
      sessionsCompleted: 1,
      hadDivisionSuccess: divisionSuccess,
      facts: fullUniverse,
      activityDates,
      totalCorrect,
      earned,
    });
    for (const b of newBadges) allNewBadges.add(b);
  }

  const newBadges = [...allNewBadges];
  await awardBadges(config.profileId, newBadges);

  return { score: correctCount, total, operations: config.operations, newBadges };
}
