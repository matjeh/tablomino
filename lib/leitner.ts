// Leitner spaced-repetition engine (pure functions, no DB).
//
// 4 boxes: nouveau(0) -> fragile(1) -> connu(2) -> maîtrisé(3).
// Promotion: 2 consecutive correct answers on a fact move it up one box.
// Demotion: a single error sends it back to fragile (but never *promotes* a
// never-seen "nouveau" fact — see min(box, 1)).

import { BOX_FRAGILE, BOX_MASTERED, Box, Fact } from './types';

/**
 * Apply the outcome of answering a fact and return the updated fact.
 * Pure: does not mutate the input.
 */
export function applyResult(fact: Fact, correct: boolean, now = Date.now()): Fact {
  const next: Fact = {
    ...fact,
    timesSeen: fact.timesSeen + 1,
    timesCorrect: fact.timesCorrect + (correct ? 1 : 0),
    lastSeen: now,
  };

  if (correct) {
    const streak = fact.consecutiveCorrect + 1;
    if (streak >= 2 && fact.box < BOX_MASTERED) {
      next.box = (fact.box + 1) as Box;
      next.consecutiveCorrect = 0; // reset on promotion
    } else {
      next.consecutiveCorrect = streak;
    }
  } else {
    // One error -> back to fragile, but keep a fresh "nouveau" at nouveau.
    next.box = Math.min(fact.box, BOX_FRAGILE) as Box;
    next.consecutiveCorrect = 0;
  }

  return next;
}

/** True once a fact has reached the top box. */
export function isMastered(fact: Fact): boolean {
  return fact.box === BOX_MASTERED;
}
