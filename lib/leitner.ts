// Leitner spaced-repetition engine (pure functions, no DB).
//
// 4 boxes: nouveau(0) -> fragile(1) -> connu(2) -> maîtrisé(3). Box is a
// persisted, incrementally-updated field — these rules only ever move it up
// or down relative to its current value, never recompute it from scratch, so
// existing progress is never silently reset when this logic changes.
//
// Promotion (cumulative, per fact, lifetime `timesCorrect` — never decreases):
//   nouveau -> fragile: any correct answer at all.
//   fragile -> connu: timesCorrect reaches 10.
//   connu -> maîtrisé: timesCorrect reaches 30 AND the trailing window of (up
//     to) the last 10 answers has a >=90% success rate.
// Demotion is event-driven, not formula-driven (a single error always drops
// exactly one box, regardless of what the rolling window would compute):
//   maîtrisé -> connu, connu -> fragile, on any wrong answer. A never-seen
//   "nouveau" fact stays at nouveau on an error (no box to fall back to).
// This means recovering maîtrisé after a slip needs the error to age out of
// the trailing 10-window — in practice ~10 more correct answers.

import { BOX_FRAGILE, BOX_KNOWN, BOX_MASTERED, BOX_NEW, Box, Fact } from './types';

const CONNU_THRESHOLD = 10;
const MASTERED_THRESHOLD = 30;
const MASTERED_RECENT_RATE = 0.9;
const RECENT_WINDOW = 10;

function pushRecent(recentResults: boolean[], correct: boolean): boolean[] {
  const next = [...recentResults, correct];
  return next.length > RECENT_WINDOW ? next.slice(next.length - RECENT_WINDOW) : next;
}

function recentSuccessRate(recentResults: boolean[]): number {
  if (recentResults.length === 0) return 0;
  return recentResults.filter(Boolean).length / recentResults.length;
}

/**
 * Apply the outcome of answering a fact and return the updated fact.
 * Pure: does not mutate the input.
 */
export function applyResult(fact: Fact, correct: boolean, now = Date.now()): Fact {
  const recentResults = pushRecent(fact.recentResults, correct);
  let box: Box = fact.box;

  if (correct) {
    if (box === BOX_NEW) box = BOX_FRAGILE;
    const timesCorrect = fact.timesCorrect + 1;
    if (box === BOX_FRAGILE && timesCorrect >= CONNU_THRESHOLD) box = BOX_KNOWN;
    if (
      box === BOX_KNOWN &&
      timesCorrect >= MASTERED_THRESHOLD &&
      recentSuccessRate(recentResults) >= MASTERED_RECENT_RATE
    ) {
      box = BOX_MASTERED;
    }
  } else if (box === BOX_MASTERED) {
    box = BOX_KNOWN;
  } else if (box === BOX_KNOWN) {
    box = BOX_FRAGILE;
  }
  // fragile and nouveau stay put on an error.

  return {
    ...fact,
    box,
    consecutiveCorrect: correct ? fact.consecutiveCorrect + 1 : 0,
    timesSeen: fact.timesSeen + 1,
    timesCorrect: fact.timesCorrect + (correct ? 1 : 0),
    lastSeen: now,
    recentResults,
  };
}

/** True once a fact has reached the top box. */
export function isMastered(fact: Fact): boolean {
  return fact.box === BOX_MASTERED;
}
