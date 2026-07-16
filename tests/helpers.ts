import { Box, Fact } from '@/lib/types';

/** Deterministic PRNG (mulberry32) for reproducible tests. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeFact(a: number, b: number, box: Box, seen = box > 0 ? 3 : 0): Fact {
  return {
    profileId: 1,
    operation: 'multiplication',
    format: 'direct',
    a,
    b,
    box,
    consecutiveCorrect: 0,
    timesSeen: seen,
    timesCorrect: seen,
    lastSeen: seen > 0 ? 1 : 0,
  };
}
