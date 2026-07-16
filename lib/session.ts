// Session assembly: choose the ~10 facts to drill from the profile's fact
// universe, weighting toward weaker facts. Pure, rng-injectable.
//
// Distribution target (spec §4): ~60% low boxes (nouveau/fragile),
// ~30% connu, ~10% maîtrisé (maintenance). At most `maxNew` never-seen facts
// are introduced per session so new material trickles in.

import { shuffle } from './distractors';
import { BOX_KNOWN, BOX_MASTERED, Fact } from './types';

export const SESSION_LENGTH = 10;
export const MAX_NEW_PER_SESSION = 3;

interface Buckets {
  unseen: Fact[];
  low: Fact[]; // seen, box 0 or 1
  known: Fact[]; // box 2
  mastered: Fact[]; // box 3
}

function bucketize(facts: Fact[], rng: () => number): Buckets {
  return {
    unseen: shuffle(facts.filter((f) => f.timesSeen === 0), rng),
    low: shuffle(
      facts.filter((f) => f.timesSeen > 0 && f.box < BOX_KNOWN),
      rng,
    ),
    known: shuffle(facts.filter((f) => f.timesSeen > 0 && f.box === BOX_KNOWN), rng),
    mastered: shuffle(
      facts.filter((f) => f.timesSeen > 0 && f.box === BOX_MASTERED),
      rng,
    ),
  };
}

/**
 * Pick the ordered list of facts for one session (length <= `count`).
 * Never returns duplicates; if the universe is smaller than `count` it returns
 * everything available.
 */
export function pickSessionFacts(
  facts: Fact[],
  {
    count = SESSION_LENGTH,
    maxNew = MAX_NEW_PER_SESSION,
    rng = Math.random,
  }: { count?: number; maxNew?: number; rng?: () => number } = {},
): Fact[] {
  const b = bucketize(facts, rng);
  const chosen: Fact[] = [];
  const taken = new Set<Fact>();

  const drawFrom = (pool: Fact[], quota: number) => {
    for (const f of pool) {
      if (chosen.length >= count || quota <= 0) break;
      if (taken.has(f)) continue;
      chosen.push(f);
      taken.add(f);
      quota--;
    }
  };

  // 1. Introduce new material (counts toward the "low" share).
  drawFrom(b.unseen, Math.min(maxNew, count));

  // 2. Quotas over the whole session; new facts already consumed part of low.
  const qLow = Math.max(0, Math.round(count * 0.6) - chosen.length);
  const qKnown = Math.round(count * 0.3);
  const qMastered = count - Math.round(count * 0.6) - qKnown; // remainder

  drawFrom(b.low, qLow);
  drawFrom(b.known, qKnown);
  drawFrom(b.mastered, qMastered);

  // 3. Fallback fill (any leftover, weakest first) until we reach `count`.
  for (const pool of [b.low, b.known, b.mastered, b.unseen]) {
    drawFrom(pool, count - chosen.length);
  }

  // Final shuffle so freshly introduced facts aren't always first.
  return shuffle(chosen, rng).slice(0, count);
}
