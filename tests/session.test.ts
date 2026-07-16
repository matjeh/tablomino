import { describe, expect, it } from 'vitest';
import { pickSessionFacts, SESSION_LENGTH, MAX_NEW_PER_SESSION } from '@/lib/session';
import { BOX_KNOWN, BOX_MASTERED, BOX_NEW, Fact } from '@/lib/types';
import { makeFact, seeded } from './helpers';

// A universe with plenty of facts in every bucket.
function bigUniverse(): Fact[] {
  const facts: Fact[] = [];
  for (let b = 1; b <= 10; b++) {
    facts.push(makeFact(2, b, BOX_NEW, 0)); // unseen
    facts.push(makeFact(3, b, 1)); // low (fragile)
    facts.push(makeFact(4, b, BOX_KNOWN)); // known
    facts.push(makeFact(5, b, BOX_MASTERED)); // mastered
  }
  return facts;
}

describe('pickSessionFacts', () => {
  it('returns exactly SESSION_LENGTH facts when the universe is large', () => {
    const picked = pickSessionFacts(bigUniverse(), { rng: seeded(42) });
    expect(picked).toHaveLength(SESSION_LENGTH);
  });

  it('never returns duplicates', () => {
    const picked = pickSessionFacts(bigUniverse(), { rng: seeded(7) });
    const keys = picked.map((f) => `${f.a}:${f.b}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('introduces at most MAX_NEW_PER_SESSION unseen facts', () => {
    const picked = pickSessionFacts(bigUniverse(), { rng: seeded(3) });
    const unseen = picked.filter((f) => f.timesSeen === 0);
    expect(unseen.length).toBeLessThanOrEqual(MAX_NEW_PER_SESSION);
  });

  it('weights toward low boxes (nouveau/fragile)', () => {
    const picked = pickSessionFacts(bigUniverse(), { rng: seeded(99) });
    const low = picked.filter((f) => f.timesSeen === 0 || f.box < BOX_KNOWN);
    // Target ~60%; allow slack but it must dominate.
    expect(low.length).toBeGreaterThanOrEqual(5);
  });

  it('handles a universe smaller than the session length', () => {
    const small = [makeFact(9, 1, 1), makeFact(9, 2, BOX_KNOWN), makeFact(9, 3, BOX_NEW, 0)];
    const picked = pickSessionFacts(small, { rng: seeded(1) });
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((f) => `${f.a}:${f.b}`)).size).toBe(3);
  });

  it('is exhaustive when all facts are mastered (maintenance)', () => {
    const mastered = Array.from({ length: 10 }, (_, i) => makeFact(6, i + 1, BOX_MASTERED));
    const picked = pickSessionFacts(mastered, { rng: seeded(5) });
    expect(picked).toHaveLength(SESSION_LENGTH);
    expect(picked.every((f) => f.box === BOX_MASTERED)).toBe(true);
  });
});
