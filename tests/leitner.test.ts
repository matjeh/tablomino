import { describe, expect, it } from 'vitest';
import { applyResult } from '@/lib/leitner';
import { BOX_FRAGILE, BOX_KNOWN, BOX_MASTERED, BOX_NEW } from '@/lib/types';
import { makeFact } from './helpers';

describe('leitner applyResult', () => {
  it('promotes nouveau to fragile on the very first correct answer', () => {
    const f = applyResult(makeFact(7, 8, BOX_NEW, 0), true);
    expect(f.box).toBe(BOX_FRAGILE);
  });

  it('keeps a never-seen fact at nouveau on an error (no promotion)', () => {
    const f = applyResult(makeFact(7, 8, BOX_NEW, 0), false);
    expect(f.box).toBe(BOX_NEW);
  });

  it('promotes fragile to connu once timesCorrect reaches 10', () => {
    let f = makeFact(7, 8, BOX_FRAGILE, 9);
    f = applyResult(f, true); // 10th correct
    expect(f.box).toBe(BOX_KNOWN);
  });

  it('does not promote to connu before the 10th correct', () => {
    let f = makeFact(7, 8, BOX_FRAGILE, 8);
    f = applyResult(f, true); // 9th correct
    expect(f.box).toBe(BOX_FRAGILE);
  });

  it('promotes connu to maîtrisé at 30 correct with a clean last-10 window', () => {
    const recent = Array(9).fill(true);
    let f = makeFact(7, 8, BOX_KNOWN, 29, recent);
    f = applyResult(f, true); // 30th correct, 10/10 recent
    expect(f.box).toBe(BOX_MASTERED);
  });

  it('withholds maîtrisé at 30 correct if the last-10 success rate is below 90%', () => {
    const recent = [...Array(7).fill(true), false, false]; // 7/9 so far
    let f = makeFact(7, 8, BOX_KNOWN, 29, recent);
    f = applyResult(f, true); // 30th correct, but recent window now 8/10 = 80%
    expect(f.box).toBe(BOX_KNOWN);
  });

  it('demotes maîtrisé directly to connu on a single error', () => {
    const f = applyResult(makeFact(7, 8, BOX_MASTERED, 35), false);
    expect(f.box).toBe(BOX_KNOWN);
  });

  it('demotes connu to fragile on a single error', () => {
    const f = applyResult(makeFact(7, 8, BOX_KNOWN, 15), false);
    expect(f.box).toBe(BOX_FRAGILE);
  });

  it('leaves fragile at fragile on an error (floor)', () => {
    const f = applyResult(makeFact(7, 8, BOX_FRAGILE, 3), false);
    expect(f.box).toBe(BOX_FRAGILE);
  });

  it('does not promote beyond mastered', () => {
    let f = makeFact(7, 8, BOX_MASTERED, 35, Array(10).fill(true));
    f = applyResult(f, true);
    f = applyResult(f, true);
    expect(f.box).toBe(BOX_MASTERED);
  });

  it('recovers maîtrisé after ~10 clean answers following a demotion', () => {
    let f = makeFact(7, 8, BOX_MASTERED, 35, Array(10).fill(true));
    f = applyResult(f, false); // demoted to connu, recent window now has 1 wrong
    expect(f.box).toBe(BOX_KNOWN);
    for (let i = 0; i < 9; i++) f = applyResult(f, true); // ages the error out of the last-10 window
    expect(f.box).toBe(BOX_MASTERED);
  });

  it('caps the recent-results window at 10 entries', () => {
    let f = makeFact(7, 8, BOX_KNOWN, 0, []);
    for (let i = 0; i < 15; i++) f = applyResult(f, true);
    expect(f.recentResults).toHaveLength(10);
  });

  it('tracks seen/correct counters', () => {
    let f = makeFact(3, 4, BOX_KNOWN);
    const before = f.timesSeen;
    f = applyResult(f, true);
    f = applyResult(f, false);
    expect(f.timesSeen).toBe(before + 2);
    expect(f.timesCorrect).toBe(f.timesCorrect); // sanity: defined
  });

  it('resets consecutive streak on error, increments on correct', () => {
    let f = makeFact(2, 2, BOX_NEW, 0);
    f = applyResult(f, true);
    expect(f.consecutiveCorrect).toBe(1);
    f = applyResult(f, false);
    expect(f.consecutiveCorrect).toBe(0);
  });
});
