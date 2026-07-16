// Multiple-choice option generation for level 1 (4 answers).
// Produces plausible near-miss distractors. Pure, rng-injectable.

/** Shuffle a copy of `arr` using the given rng. */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Return `n` plausible wrong answers for `answer`. Candidates are near-misses
 * (±1, ±2, ±10, small multiples) filtered to be unique, non-negative and
 * different from the answer. Falls back to a widening scan if needed.
 */
export function distractors(
  answer: number,
  n = 3,
  rng: () => number = Math.random,
): number[] {
  const candidates = new Set<number>();
  const deltas = [1, -1, 2, -2, 10, -10, 5, -5, 3, -3];
  for (const d of shuffle(deltas, rng)) {
    const v = answer + d;
    if (v >= 0 && v !== answer) candidates.add(v);
    if (candidates.size >= n) break;
  }
  // Widening fallback to guarantee we can always produce n distinct values.
  let delta = 4;
  while (candidates.size < n) {
    for (const v of [answer + delta, answer - delta]) {
      if (v >= 0 && v !== answer) candidates.add(v);
      if (candidates.size >= n) break;
    }
    delta++;
  }
  return [...candidates].slice(0, n);
}

/** The 4 shuffled choices for a question (correct answer + 3 distractors). */
export function buildChoices(
  answer: number,
  rng: () => number = Math.random,
): number[] {
  return shuffle([answer, ...distractors(answer, 3, rng)], rng);
}
